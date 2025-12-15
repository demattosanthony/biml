"""JSON IR types matching BIML output (v0.6.0)."""

from dataclasses import dataclass, field
from typing import Self, Literal
import json


WallDirection = Literal["north", "south", "east", "west"]
SwingDirection = Literal["in", "out", "in-left", "in-right", "out-left", "out-right", "double"]
OffsetAnchor = Literal["left", "right", "start", "end", "north", "south", "east", "west"]


# ============================================================================
# Shared Types
# ============================================================================

@dataclass
class MeasurementIR:
    value: float
    unit: str

    def to_meters(self) -> float:
        """Convert measurement to meters."""
        unit = self.unit.lower()
        if unit == "m":
            return self.value
        elif unit == "cm":
            return self.value / 100.0
        elif unit == "mm":
            return self.value / 1000.0
        elif unit == "ft":
            return self.value * 0.3048
        elif unit == "in":
            return self.value * 0.0254
        elif unit == "m²":
            return self.value  # Area, return as-is
        elif unit == "ft²":
            return self.value * 0.092903  # Convert sq ft to sq m
        else:
            return self.value  # Assume meters


@dataclass
class PositionIR:
    row: int
    col: int

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(row=data["row"], col=data["col"])


# ============================================================================
# Materials (v0.5.0)
# ============================================================================

@dataclass
class ColorIR:
    red: float
    green: float
    blue: float

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            red=data["red"],
            green=data["green"],
            blue=data["blue"],
        )


@dataclass
class MaterialIR:
    name: str
    color: ColorIR | None = None
    transparency: float | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            color=ColorIR.from_dict(data["color"]) if data.get("color") else None,
            transparency=data.get("transparency"),
        )


# ============================================================================
# Library & Type System (v0.5.0)
# ============================================================================

@dataclass
class ExpressionIR:
    kind: str  # "literal" | "measurement" | "reference" | "binary" | "boolean" | "string"
    value: float | None = None
    unit: str | None = None
    ref: str | None = None
    op: str | None = None
    left: "ExpressionIR | None" = None
    right: "ExpressionIR | None" = None
    bool_value: bool | None = None
    string_value: str | None = None

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
            bool_value=data.get("boolValue"),
            string_value=data.get("stringValue"),
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
    value: MeasurementIR | float | bool | str

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
    base_type: str | None = None
    material: str | None = None  # Reference to material name

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            family=data["family"],
            parameters=[ResolvedParameterIR.from_dict(p) for p in data.get("parameters", [])],
            base_type=data.get("baseType"),
            material=data.get("material"),
        )

    def get_parameter(self, name: str) -> MeasurementIR | float | bool | str | None:
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
    materials: list[MaterialIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            families=[FamilyIR.from_dict(f) for f in data.get("families", [])],
            types=[TypeIR.from_dict(t) for t in data.get("types", [])],
            materials=[MaterialIR.from_dict(m) for m in data.get("materials", [])],
        )

    def get_material(self, name: str) -> MaterialIR | None:
        """Look up a material by name."""
        for m in self.materials:
            if m.name == name:
                return m
        return None


# ============================================================================
# Door Offset Types (v0.4.0)
# ============================================================================

@dataclass
class DoorOffsetNormalizedIR:
    kind: Literal["normalized"] = "normalized"
    value: float = 0.5

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(value=data["value"])


@dataclass
class DoorOffsetCenterIR:
    kind: Literal["center"] = "center"

    @classmethod
    def from_dict(cls, _data: dict) -> Self:
        return cls()


@dataclass
class DoorOffsetAbsoluteIR:
    kind: Literal["absolute"] = "absolute"
    distance: MeasurementIR = field(default_factory=lambda: MeasurementIR(0, "m"))
    anchor: OffsetAnchor = "left"

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            distance=MeasurementIR(**data["distance"]),
            anchor=data["anchor"],
        )


DoorOffsetIR = DoorOffsetNormalizedIR | DoorOffsetCenterIR | DoorOffsetAbsoluteIR


def parse_door_offset(data: dict | None) -> DoorOffsetIR | None:
    """Parse door offset from dict."""
    if data is None:
        return None
    kind = data.get("kind")
    if kind == "normalized":
        return DoorOffsetNormalizedIR.from_dict(data)
    elif kind == "center":
        return DoorOffsetCenterIR.from_dict(data)
    elif kind == "absolute":
        return DoorOffsetAbsoluteIR.from_dict(data)
    return None


# ============================================================================
# Project Hierarchy (v0.4.0)
# ============================================================================

@dataclass
class SpaceDoorIR:
    name: str
    type_ref: str | None = None
    width: MeasurementIR | None = None
    height: MeasurementIR | None = None
    wall: WallDirection | None = None
    offset: DoorOffsetIR | None = None
    swing: SwingDirection | None = None
    connects: str | None = None  # Target space name for interior doors
    material: str | None = None  # Material override

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            type_ref=data.get("typeRef"),
            width=MeasurementIR(**data["width"]) if data.get("width") else None,
            height=MeasurementIR(**data["height"]) if data.get("height") else None,
            wall=data.get("wall"),
            offset=parse_door_offset(data.get("offset")),
            swing=data.get("swing"),
            connects=data.get("connects"),
            material=data.get("material"),
        )


@dataclass
class AspectIR:
    width_ratio: float
    length_ratio: float

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            width_ratio=data["widthRatio"],
            length_ratio=data["lengthRatio"],
        )


@dataclass
class SpaceIR:
    name: str
    position: PositionIR | None = None
    area: MeasurementIR | None = None
    width: MeasurementIR | None = None
    length: MeasurementIR | None = None
    aspect: AspectIR | None = None
    doors: list[SpaceDoorIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            position=PositionIR.from_dict(data["position"]) if data.get("position") else None,
            area=MeasurementIR(**data["area"]) if data.get("area") else None,
            width=MeasurementIR(**data["width"]) if data.get("width") else None,
            length=MeasurementIR(**data["length"]) if data.get("length") else None,
            aspect=AspectIR.from_dict(data["aspect"]) if data.get("aspect") else None,
            doors=[SpaceDoorIR.from_dict(d) for d in data.get("doors", [])],
        )


@dataclass
class LevelIR:
    name: str
    elevation: MeasurementIR | None = None
    height: MeasurementIR | None = None
    slab_thickness: MeasurementIR | None = None
    ceiling_thickness: MeasurementIR | None = None
    spaces: list[SpaceIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            elevation=MeasurementIR(**data["elevation"]) if data.get("elevation") else None,
            height=MeasurementIR(**data["height"]) if data.get("height") else None,
            slab_thickness=MeasurementIR(**data["slabThickness"]) if data.get("slabThickness") else None,
            ceiling_thickness=MeasurementIR(**data["ceilingThickness"]) if data.get("ceilingThickness") else None,
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

    def get_material(self, name: str) -> MaterialIR | None:
        """Look up a material by name across all libraries."""
        for lib in self.libraries:
            mat = lib.get_material(name)
            if mat:
                return mat
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
