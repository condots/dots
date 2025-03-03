from rdflib import Graph
import click
from pathlib import Path
from pygments import highlight
from pygments.lexers import TurtleLexer
from pygments.formatters import TerminalFormatter


@click.command()
@click.argument(
    "filename",
    type=click.Path(exists=True),
)
def main(filename):
    g = Graph()
    g.parse(data=Path(filename).read_text(), format="json-ld")
    t = g.serialize(format="turtle")
    h = highlight(t, TurtleLexer(), TerminalFormatter())
    click.secho(h)


if __name__ == "__main__":
    main()
