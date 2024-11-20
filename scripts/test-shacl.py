import rdflib
from pyshacl import validate
import click
from pathlib import Path

SPDX_MODEL = "https://spdx.github.io/spdx-spec/v3.0.1/rdf/spdx-model.ttl"


def validate_shacl(shapes_graph, data_graph):
    conforms, report, message = validate(
        data_graph,
        shacl_graph=shapes_graph,
        allow_warnings=True,
        advanced=True,
        debug=False,
    )

    for violation in report.subjects(rdflib.RDF.type, rdflib.SH["ValidationResult"]):
        svr = report.value(
            subject=violation,
            predicate=rdflib.SH["resultSeverity"],
        ).lstrip("http://www.w3.org/ns/shacl#")
        pth = report.value(
            subject=violation,
            predicate=rdflib.SH["resultPath"],
        )
        cst = report.value(
            subject=violation,
            predicate=rdflib.SH["sourceConstraintComponent"],
        ).lstrip("http://www.w3.org/ns/shacl#")
        msg = report.value(
            subject=violation,
            predicate=rdflib.SH["resultMessage"],
        )
        value_node = report.value(
            subject=violation,
            predicate=rdflib.SH["value"],
        )
        focus_node = report.value(
            subject=violation,
            predicate=rdflib.SH["focusNode"],
        )
        parent_node = None
        for s, p, o in data_graph.triples((None, None, focus_node)):
            parent_node = s
            break

        click.secho(f"-" * 100)
        click.secho(f"{svr} message: {msg}")
        click.secho(f"Violation constraint: {cst}")
        click.secho(f"Violation value: {value_node}")
        click.secho(f"Property path: {pth}")
        click.secho(f"Focus node: {focus_node}")
        if parent_node:
            click.secho(f"BlankNode parent: {parent_node}")
        click.secho(f"-" * 100)


def list_shapes(shapes_graph):
    for shape in shapes_graph.subjects(rdflib.RDF.type, rdflib.SH["NodeShape"]):
        print(shape)
        for prop in shapes_graph.objects(shape, rdflib.SH["property"]):
            path = shapes_graph.value(prop, rdflib.SH["path"])
            if path:
                print(f"  Property path: {path}")
                for p, o in shapes_graph.predicate_objects(prop):
                    if p != rdflib.SH["path"]:
                        print(f"    {p}: {o}")


@click.command()
@click.option(
    "--shapes",
    "-s",
    type=click.Path(exists=True),
    help="Path to SHACL shapes file",
    default="shapes.ttl",
)
@click.option(
    "--data",
    "-d",
    type=click.Path(exists=True),
    help="Path to RDF data file",
    default="data.ttl",
)
def main(shapes, data):
    shapes_graph = rdflib.Graph()
    shapes_graph.parse(SPDX_MODEL, format="turtle")
    shapes_graph.parse(data=Path(shapes).read_text(), format="turtle")
    data_graph = rdflib.Graph()
    data_graph.parse(data=Path(data).read_text(), format="turtle")
    validate_shacl(shapes_graph, data_graph)


if __name__ == "__main__":
    main()
