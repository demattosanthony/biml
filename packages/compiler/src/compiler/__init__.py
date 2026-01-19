"""BIML v2.1 Compiler - JSON IR to IFC transformation (types-only model)."""

from .ir import (
    JsonIR,
    MeasurementIR,
    LibraryIR,
    ParameterIR,
    TypeIR,
    MaterialIR,
    BuildingIR,
    LevelIR,
    WallIR,
    SpaceIR,
    DoorIR,
    WindowIR,
    ColumnIR,
    FurnitureIR,
    SlabIR,
)
from .ifc import compile_to_ifc

__all__ = [
    "JsonIR",
    "MeasurementIR",
    "LibraryIR",
    "ParameterIR",
    "TypeIR",
    "MaterialIR",
    "BuildingIR",
    "LevelIR",
    "WallIR",
    "SpaceIR",
    "DoorIR",
    "WindowIR",
    "ColumnIR",
    "FurnitureIR",
    "SlabIR",
    "compile_to_ifc",
]
