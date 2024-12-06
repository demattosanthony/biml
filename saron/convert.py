import ifcpatch
import ifcopenshell
import argparse

parser = argparse.ArgumentParser(description="Migrate an IFC file to a different schema.")
parser.add_argument("--input", help="The input IFC file.")
parser.add_argument("--output", help="The output IFC file.")

args = parser.parse_args()
assert args.input, "An input IFC file must be provided."
assert args.output, "An output IFC file must be provided."

model = ifcopenshell.open(args.input)

output = ifcpatch.execute({"input": "input.ifc", "file": model, "recipe": "Migrate", "arguments": ["IFC4"]})

ifcpatch.write(output, args.output)
