"""JSON IR types matching BIML output (v0.3.0 hierarchical)."""

from dataclasses import dataclass, field
from typing import Self, Literal, Any
import json


WallDirection = Literal["north", "south", "east", "west"]


# ============================================================================
# Shared Types
# ============================================================================

@dataclass
class MeasurementIR:
    value: float
    unit: str


@dataclass
class PositionIR:
    row: int
    col: int

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(row=data["row"], col=data["col"])


# ============================================================================
# Library & Type System (v0.3.0)
# ============================================================================

@dataclass
class ExpressionIR:
    kind: str  # "literal" | "measurement" | "reference" | "binary"
    value: float | None = None
    unit: str | None = None
    ref: str | None = None
    op: str | None = None
    left: "ExpressionIR | None" = None
    right: "ExpressionIR | None" = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            kind=data["kind"],
            value=data.get("value"),
            unit=data.get("unit"),
            ref=data.get("ref"),
            op=data.get("op"),
            left=cls.from_dict(data["left"]) if data.get("left") else None,
            right=cls.from_dict(data["right"]) if data.get("right") else None,
        )


@dataclass
class ParameterIR:
    name: str
    param_type: str
    default_value: ExpressionIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            param_type=data["paramType"],
            default_value=ExpressionIR.from_dict(data["defaultValue"]) if data.get("defaultValue") else None,
        )


@dataclass
class ResolvedParameterIR:
    name: str
    value: MeasurementIR | float

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        value = data["value"]
        if isinstance(value, dict):
            value = MeasurementIR(**value)
        return cls(name=data["name"], value=value)


@dataclass
class FamilyIR:
    name: str
    parameters: list[ParameterIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            parameters=[ParameterIR.from_dict(p) for p in data.get("parameters", [])],
        )


@dataclass
class TypeIR:
    name: str
    family: str
    parameters: list[ResolvedParameterIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            family=data["family"],
            parameters=[ResolvedParameterIR.from_dict(p) for p in data.get("parameters", [])],
        )

    def get_parameter(self, name: str) -> MeasurementIR | float | None:
        """Get a resolved parameter value by name."""
        for p in self.parameters:
            if p.name == name:
                return p.value
        return None


@dataclass
class LibraryIR:
    name: str
    families: list[FamilyIR] = field(default_factory=list)
    types: list[TypeIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            families=[FamilyIR.from_dict(f) for f in data.get("families", [])],
            types=[TypeIR.from_dict(t) for t in data.get("types", [])],
        )


# ============================================================================
# Project Hierarchy (v0.3.0)
# ============================================================================

@dataclass
class SpaceDoorIR:
    name: str
    type_ref: str | None = None
    width: MeasurementIR | None = None
    height: MeasurementIR | None = None
    wall: WallDirection | None = None
    offset: float | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            type_ref=data.get("typeRef"),
            width=MeasurementIR(**data["width"]) if data.get("width") else None,
            height=MeasurementIR(**data["height"]) if data.get("height") else None,
            wall=data.get("wall"),
            offset=data.get("offset"),
        )


@dataclass
class SpaceIR:
    name: str
    position: PositionIR | None = None
    area: MeasurementIR | None = None
    width: MeasurementIR | None = None
    length: MeasurementIR | None = None
    doors: list[SpaceDoorIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            position=PositionIR.from_dict(data["position"]) if data.get("position") else None,
            area=MeasurementIR(**data["area"]) if data.get("area") else None,
            width=MeasurementIR(**data["width"]) if data.get("width") else None,
            length=MeasurementIR(**data["length"]) if data.get("length") else None,
            doors=[SpaceDoorIR.from_dict(d) for d in data.get("doors", [])],
        )


@dataclass
class LevelIR:
    name: str
    elevation: MeasurementIR | None = None
    height: MeasurementIR | None = None
    spaces: list[SpaceIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            elevation=MeasurementIR(**data["elevation"]) if data.get("elevation") else None,
            height=MeasurementIR(**data["height"]) if data.get("height") else None,
            spaces=[SpaceIR.from_dict(s) for s in data.get("spaces", [])],
        )


@dataclass
class BuildingIR:
    name: str
    levels: list[LevelIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            levels=[LevelIR.from_dict(l) for l in data.get("levels", [])],
        )


@dataclass
class SiteIR:
    name: str
    buildings: list[BuildingIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            buildings=[BuildingIR.from_dict(b) for b in data.get("buildings", [])],
        )


@dataclass
class ProjectIR:
    name: str
    sites: list[SiteIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            sites=[SiteIR.from_dict(s) for s in data.get("sites", [])],
        )


# ============================================================================
# Top-level IR
# ============================================================================

@dataclass
class JsonIR:
    version: str
    libraries: list[LibraryIR] = field(default_factory=list)
    projects: list[ProjectIR] = field(default_factory=list)

    def get_type(self, name: str) -> TypeIR | None:
        """Look up a type by name across all libraries."""
        for lib in self.libraries:
            for t in lib.types:
                if t.name == name:
                    return t
        return None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            version=data["version"],
            libraries=[LibraryIR.from_dict(l) for l in data.get("libraries", [])],
            projects=[ProjectIR.from_dict(p) for p in data.get("projects", [])],
        )

    @classmethod
    def from_json(cls, json_str: str) -> Self:
        return cls.from_dict(json.loads(json_str))

    @classmethod
    def from_file(cls, path: str) -> Self:
        with open(path) as f:
            return cls.from_dict(json.load(f))
