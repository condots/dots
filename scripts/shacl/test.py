import rdflib
from pyshacl import validate
import click
from pathlib import Path
import requests
import re


prefix_mapping = {}


def replace_prefixes(value):
    if isinstance(value, str):
        for full_uri, prefix in prefix_mapping.items():
            value = value.replace(full_uri, prefix)
    return value


def print_validation_results(report, results, indent=0):
    violation_count = 0
    for result in results:
        severity = replace_prefixes(report.value(result, rdflib.SH["resultSeverity"]))
        source_shape = replace_prefixes(report.value(result, rdflib.SH["sourceShape"]))
        focus_node = replace_prefixes(report.value(result, rdflib.SH["focusNode"]))
        value_node = replace_prefixes(report.value(result, rdflib.SH["value"]))
        result_path = replace_prefixes(report.value(result, rdflib.SH["resultPath"]))
        message = replace_prefixes(report.value(result, rdflib.SH["resultMessage"]))

        violation_count += 1
        click.secho(f"-" * 100)
        if indent > 0:
            click.secho(f"{(indent - 2) * ' '}Details:")
        click.secho(f"{indent * ' '}Severity: {severity}")
        click.secho(f"{indent * ' '}Source Shape: {source_shape}")
        click.secho(f"{indent * ' '}Focus Node: {focus_node}")
        click.secho(f"{indent * ' '}Value Node: {value_node}")
        click.secho(f"{indent * ' '}Result Path: {result_path}")
        click.secho(f"{indent * ' '}Message: {message}")

        details = [*report.objects(result, rdflib.SH["detail"])]
        if details:
            print_validation_results(report, details, indent + 4)
    return violation_count


def validate_shacl(model_graph, shapes_graph, data_graph, inference):
    conforms, report, message = validate(
        data_graph=data_graph,
        shacl_graph=shapes_graph,
        ont_graph=model_graph,
        inference=inference,
    )

    if isinstance(report, rdflib.Graph):
        results = report.subjects(rdflib.RDF.type, rdflib.SH["ValidationResult"])
        if conforms:
            click.secho("No SHACL violations found!", fg="green")
        else:
            violation_count = print_validation_results(report, results)
            click.secho(f"-" * 100)
            click.secho(f"Found {violation_count} SHACL violations!", fg="red")
    else:
        click.secho("SHACL validation failed!", fg="red")
        click.secho(f"Error message: {message}", fg="yellow")


@click.command()
@click.option(
    "--model",
    "-m",
    help="URL to SPDX model",
    default="https://spdx.github.io/spdx-spec/v3.0.1/rdf/spdx-model.ttl",
)
@click.option(
    "--shapes",
    "-s",
    type=click.Path(exists=True),
    help="Path to SHACL shapes",
    default="shapes.ttl",
)
@click.option(
    "--data",
    "-d",
    type=click.Path(exists=True),
    help="Path to test data",
    default="data.ttl",
)
@click.option(
    "--prefixes",
    "-p",
    type=click.Path(exists=True),
    help="Path to prefixes",
    default="prefixes.ttl",
)
@click.option(
    "--inference",
    "-i",
    type=click.Choice(["none", "rdfs", "owlrl", "both"]),
    help="Inference type {none,rdfs,owlrl,both}",
    default="none",
)
def main(model, shapes, data, prefixes, inference):
    prefixes_content = Path(prefixes).read_text()

    model_graph = rdflib.Graph()
    if re.match(r"^https?://", model):
        model_content = requests.get(model).text
    else:
        model_content = Path(model).read_text()
    model_graph.parse(data=model_content + prefixes_content, format="turtle")

    shapes_graph = rdflib.Graph()
    shapes_content = Path(shapes).read_text()
    shapes_graph.parse(
        data=model_content + shapes_content + prefixes_content, format="turtle"
    )

    data_graph = rdflib.Graph()
    data_content = Path(data).read_text()
    data_graph.parse(data=data_content + prefixes_content, format="turtle")

    global prefix_mapping
    prefix_mapping = {str(ns): prefix + ":" for prefix, ns in data_graph.namespaces()}

    if inference != "none":
        s = f"# # #    Will perform pre-inferencing of type: {inference}   # # #"
        click.secho("#" * len(s), fg="yellow")
        click.secho(s, fg="yellow")
        click.secho("#" * len(s), fg="yellow")
    validate_shacl(shapes_graph, shapes_graph, data_graph, inference)


if __name__ == "__main__":
    main()
