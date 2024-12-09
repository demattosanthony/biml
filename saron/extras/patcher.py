import ifcpatch
import ifcopenshell
import argparse

parser = argparse.ArgumentParser(description="Migrate an IFC file to a different schema.")
parser.add_argument("--input", help="The input IFC file.")
parser.add_argument("--output", help="The output IFC file.")
parser.add_argument("--recipe", default="Migrate", help="The recipe to use for the migration.")
parser.add_argument("--arguments", default="IFC4", help="The arguments to pass to the recipe.")

args = parser.parse_args()
assert args.input, "An input IFC file must be provided."
assert args.output, "An output IFC file must be provided."

model = ifcopenshell.open(args.input)

output = ifcpatch.execute({"input": "input.ifc", "file": model, "recipe": args.recipe, "arguments": [args.arguments]})

ifcpatch.write(output, args.output)
