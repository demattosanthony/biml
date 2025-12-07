"""CLI for BIM compiler."""

import argparse
import sys
from .ir import JsonIR
from .ifc import compile_to_ifc


def main():
    parser = argparse.ArgumentParser(description="Compile BIM JSON IR to IFC")
    parser.add_argument("input", help="Input JSON IR file (use '-' for stdin)")
    parser.add_argument("-o", "--output", default="output.ifc", help="Output IFC file")
    args = parser.parse_args()

    # Read input
    if args.input == "-":
        ir = JsonIR.from_json(sys.stdin.read())
    else:
        ir = JsonIR.from_file(args.input)

    # Compile to IFC
    ifc = compile_to_ifc(ir)

    # Write output
    ifc.write(args.output)
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
