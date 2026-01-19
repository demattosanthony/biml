"""JSON IR types for BIML."""

from dataclasses import dataclass, field
from typing import Self, Literal, Any
import json


# ============================================================================
# Basic Types
# ============================================================================


@dataclass
class MeasurementIR:
    value: float
    unit: str

    def to_meters(self) -> float:
        """Convert measurement to meters."""
        unit = self.unit.lower()
        conversions = {
            "m": 1.0,
            "cm": 0.01,
            "mm": 0.001,
            "ft": 0.3048,
            "in": 0.0254,
            "m²": 1.0,  # Area, return as-is
            "sqm": 1.0,
            "ft²": 0.092903,
            "sqft": 0.092903,
        }
        return self.value * conversions.get(unit, 1.0)

    @classmethod
    def from_dict(cls, data: dict | None) -> Self | None:
        if data is None:
            return None
        return cls(value=data["value"], unit=data["unit"])


@dataclass
class Point2DIR:
    x: float
    y: float

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(x=data["x"], y=data["y"])


@dataclass
class ColorIR:
    red: float
    green: float
    blue: float

    @classmethod
    def from_dict(cls, data: dict | None) -> Self | None:
        if data is None:
            return None
        return cls(red=data["red"], green=data["green"], blue=data["blue"])


# ============================================================================
# Expression IR
# ============================================================================


@dataclass
class ExpressionIR:
    kind: str
    value: float | None = None
    unit: str | None = None
    bool_value: bool | None = None
    string_value: str | None = None

    @classmethod
    def from_dict(cls, data: dict | None) -> Self | None:
        if data is None:
            return None
        return cls(
            kind=data["kind"],
            value=data.get("value"),
            unit=data.get("unit"),
            bool_value=data.get("boolValue"),
            string_value=data.get("stringValue"),
        )

    def evaluate(
        self, context: dict[str, Any] | None = None
    ) -> float | bool | str | MeasurementIR:
        """Evaluate expression to a concrete value."""
        if self.kind == "literal":
            return self.value or 0
        if self.kind == "measurement":
            return MeasurementIR(value=self.value or 0, unit=self.unit or "m")
        if self.kind == "boolean":
            return self.bool_value or False
        if self.kind == "string":
            return self.string_value or ""
        return 0


@dataclass
class ParameterIR:
    """Parameter definition within a type."""

    name: str
    type: str
    default_value: ExpressionIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            type=data["type"],
            default_value=ExpressionIR.from_dict(data.get("defaultValue")),
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
            color=ColorIR.from_dict(data.get("color")),
            transparency=data.get("transparency"),
        )


@dataclass
class TypeIR:
    """Unified type definition (no families)."""

    name: str
    base_type: str | None = None
    parameters: list[ParameterIR] = field(default_factory=list)
    overrides: dict[str, ExpressionIR] = field(default_factory=dict)
    material: str | None = None
    ifc_class: str | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        # Handle both new format (parameters as list, overrides as dict)
        # and old format (parameters as dict) for backward compatibility
        parameters_data = data.get("parameters", [])
        overrides_data = data.get("overrides", {})

        if isinstance(parameters_data, list):
            parameters = [ParameterIR.from_dict(p) for p in parameters_data]
        else:
            # Old format: parameters was a dict of overrides
            parameters = []
            overrides_data = parameters_data

        overrides: dict[str, ExpressionIR] = {}
        for key, value in overrides_data.items():
            expr = ExpressionIR.from_dict(value)
            if expr is not None:
                overrides[str(key)] = expr

        return cls(
            name=data["name"],
            base_type=data.get("baseType"),
            parameters=parameters,
            overrides=overrides,
            material=data.get("material"),
            ifc_class=data.get("ifcClass"),
        )

    def get_parameter_default(self, name: str) -> ExpressionIR | None:
        """Get the default value for a parameter definition."""
        for param in self.parameters:
            if param.name == name:
                return param.default_value
        return None

    def get_parameter_value(
        self, name: str, context: dict[str, Any] | None = None
    ) -> MeasurementIR | float | bool | str | None:
        """Get resolved parameter value (override or default)."""
        # First check overrides
        if name in self.overrides:
            result = self.overrides[name].evaluate(context)
            return result

        # Then check parameter defaults
        default = self.get_parameter_default(name)
        if default:
            return default.evaluate(context)

        return None


@dataclass
class LibraryIR:
    """Library containing materials and types."""

    name: str
    materials: list[MaterialIR] = field(default_factory=list)
    types: list[TypeIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            materials=[MaterialIR.from_dict(m) for m in data.get("materials", [])],
            types=[TypeIR.from_dict(t) for t in data.get("types", [])],
        )

    def get_material(self, name: str) -> MaterialIR | None:
        for m in self.materials:
            if m.name == name:
                return m
        return None

    def get_type(self, name: str) -> TypeIR | None:
        for t in self.types:
            if t.name == name:
                return t
        return None


# ============================================================================
# Building Elements IR
# ============================================================================


@dataclass
class WallIR:
    name: str
    start: Point2DIR
    end: Point2DIR
    thickness: MeasurementIR | None = None
    height: MeasurementIR | None = None
    material: str | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            start=Point2DIR.from_dict(data["start"]),
            end=Point2DIR.from_dict(data["end"]),
            thickness=MeasurementIR.from_dict(data.get("thickness")),
            height=MeasurementIR.from_dict(data.get("height")),
            material=data.get("material"),
        )

    def length(self) -> float:
        """Calculate wall length."""
        dx = self.end.x - self.start.x
        dy = self.end.y - self.start.y
        return (dx * dx + dy * dy) ** 0.5


@dataclass
class DoorPositionIR:
    kind: str  # "absolute", "center", "from_anchor"
    value: MeasurementIR | None = None
    anchor: str | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            kind=data["kind"],
            value=MeasurementIR.from_dict(data.get("value")),
            anchor=data.get("anchor"),
        )


@dataclass
class DoorConnectsIR:
    from_space: str
    to_space: str

    @classmethod
    def from_dict(cls, data: dict | None) -> Self | None:
        if data is None:
            return None
        return cls(
            from_space=data["from"],
            to_space=data["to"],
        )


@dataclass
class DoorIR:
    name: str
    wall: str
    position: DoorPositionIR
    type_ref: str | None = None
    width: MeasurementIR | None = None
    height: MeasurementIR | None = None
    swing: str | None = None
    connects: DoorConnectsIR | None = None
    material: str | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            wall=data["wall"],
            position=DoorPositionIR.from_dict(data["position"]),
            type_ref=data.get("typeRef"),
            width=MeasurementIR.from_dict(data.get("width")),
            height=MeasurementIR.from_dict(data.get("height")),
            swing=data.get("swing"),
            connects=DoorConnectsIR.from_dict(data.get("connects")),
            material=data.get("material"),
        )


@dataclass
class WindowIR:
    name: str
    wall: str
    position: DoorPositionIR
    type_ref: str | None = None
    width: MeasurementIR | None = None
    height: MeasurementIR | None = None
    sill: MeasurementIR | None = None
    material: str | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            wall=data["wall"],
            position=DoorPositionIR.from_dict(data["position"]),
            type_ref=data.get("typeRef"),
            width=MeasurementIR.from_dict(data.get("width")),
            height=MeasurementIR.from_dict(data.get("height")),
            sill=MeasurementIR.from_dict(data.get("sill")),
            material=data.get("material"),
        )


@dataclass
class ColumnIR:
    name: str
    position: Point2DIR
    type_ref: str | None = None
    width: MeasurementIR | None = None
    depth: MeasurementIR | None = None
    height: MeasurementIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            position=Point2DIR.from_dict(data["position"]),
            type_ref=data.get("typeRef"),
            width=MeasurementIR.from_dict(data.get("width")),
            depth=MeasurementIR.from_dict(data.get("depth")),
            height=MeasurementIR.from_dict(data.get("height")),
        )


@dataclass
class FurnitureSizeIR:
    width: MeasurementIR
    depth: MeasurementIR

    @classmethod
    def from_dict(cls, data: dict | None) -> Self | None:
        if data is None:
            return None
        width = MeasurementIR.from_dict(data.get("width"))
        depth = MeasurementIR.from_dict(data.get("depth"))
        if not width or not depth:
            return None
        return cls(width=width, depth=depth)


@dataclass
class FurnitureIR:
    type_ref: str
    position: Point2DIR
    name: str | None = None
    facing: str | None = None
    size: FurnitureSizeIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            type_ref=data["typeRef"],
            position=Point2DIR.from_dict(data["position"]),
            name=data.get("name"),
            facing=data.get("facing"),
            size=FurnitureSizeIR.from_dict(data.get("size")),
        )


@dataclass
class SlabIR:
    name: str
    boundary: list[Point2DIR]
    thickness: MeasurementIR | None = None
    material: str | None = None
    slab_type: str | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            boundary=[Point2DIR.from_dict(p) for p in data.get("boundary", [])],
            thickness=MeasurementIR.from_dict(data.get("thickness")),
            material=data.get("material"),
            slab_type=data.get("type"),
        )


@dataclass
class WallReferenceIR:
    wall: str
    segment_start: MeasurementIR | None = None
    segment_end: MeasurementIR | None = None
    reversed: bool = False

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            wall=data["wall"],
            segment_start=MeasurementIR.from_dict(data.get("segmentStart")),
            segment_end=MeasurementIR.from_dict(data.get("segmentEnd")),
            reversed=data.get("reversed", False),
        )


@dataclass
class SpaceIR:
    name: str
    tags: list[str] = field(default_factory=list)
    bounded_by: list[WallReferenceIR] | None = None
    area: MeasurementIR | None = None
    height: MeasurementIR | None = None
    floor: str | None = None
    ceiling: str | None = None
    doors: list[DoorIR] = field(default_factory=list)
    windows: list[WindowIR] = field(default_factory=list)
    furniture: list[FurnitureIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            tags=data.get("tags", []),
            bounded_by=[WallReferenceIR.from_dict(w) for w in data.get("boundedBy", [])]
            if data.get("boundedBy")
            else None,
            area=MeasurementIR.from_dict(data.get("area")),
            height=MeasurementIR.from_dict(data.get("height")),
            floor=data.get("floor"),
            ceiling=data.get("ceiling"),
            doors=[DoorIR.from_dict(d) for d in data.get("doors", [])],
            windows=[WindowIR.from_dict(w) for w in data.get("windows", [])],
            furniture=[FurnitureIR.from_dict(f) for f in data.get("furniture", [])],
        )


@dataclass
class ElevationIR:
    """Elevation can be absolute or relative to another level."""

    value: MeasurementIR | None = None
    ref: str | None = None

    @classmethod
    def from_dict(cls, data: dict | MeasurementIR) -> Self:
        if isinstance(data, dict):
            if "ref" in data:
                return cls(ref=data["ref"])
            elif "value" in data and "unit" in data:
                return cls(value=MeasurementIR(value=data["value"], unit=data["unit"]))
        return cls(value=MeasurementIR(value=0, unit="m"))


@dataclass
class LevelIR:
    name: str
    elevation: ElevationIR
    height: MeasurementIR | None = None
    walls: list[WallIR] = field(default_factory=list)
    spaces: list[SpaceIR] = field(default_factory=list)
    doors: list[DoorIR] = field(default_factory=list)
    windows: list[WindowIR] = field(default_factory=list)
    columns: list[ColumnIR] = field(default_factory=list)
    furniture: list[FurnitureIR] = field(default_factory=list)
    slabs: list[SlabIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            elevation=ElevationIR.from_dict(data["elevation"]),
            height=MeasurementIR.from_dict(data.get("height")),
            walls=[WallIR.from_dict(w) for w in data.get("walls", [])],
            spaces=[SpaceIR.from_dict(s) for s in data.get("spaces", [])],
            doors=[DoorIR.from_dict(d) for d in data.get("doors", [])],
            windows=[WindowIR.from_dict(w) for w in data.get("windows", [])],
            columns=[ColumnIR.from_dict(c) for c in data.get("columns", [])],
            furniture=[FurnitureIR.from_dict(f) for f in data.get("furniture", [])],
            slabs=[SlabIR.from_dict(s) for s in data.get("slabs", [])],
        )


@dataclass
class BuildingDefaultsIR:
    wall_thickness: MeasurementIR | None = None
    floor_thickness: MeasurementIR | None = None
    ceiling_height: MeasurementIR | None = None
    door_height: MeasurementIR | None = None
    window_sill: MeasurementIR | None = None

    @classmethod
    def from_dict(cls, data: dict | None) -> Self | None:
        if data is None:
            return None
        return cls(
            wall_thickness=MeasurementIR.from_dict(data.get("wallThickness")),
            floor_thickness=MeasurementIR.from_dict(data.get("floorThickness")),
            ceiling_height=MeasurementIR.from_dict(data.get("ceilingHeight")),
            door_height=MeasurementIR.from_dict(data.get("doorHeight")),
            window_sill=MeasurementIR.from_dict(data.get("windowSill")),
        )


@dataclass
class SiteIR:
    name: str
    location: tuple[float, float] | None = None

    @classmethod
    def from_dict(cls, data: dict | None) -> Self | None:
        if data is None:
            return None
        location = None
        if data.get("location"):
            location = (data["location"]["latitude"], data["location"]["longitude"])
        return cls(name=data["name"], location=location)


@dataclass
class BuildingIR:
    name: str
    defaults: BuildingDefaultsIR | None = None
    site: SiteIR | None = None
    levels: list[LevelIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            defaults=BuildingDefaultsIR.from_dict(data.get("defaults")),
            site=SiteIR.from_dict(data.get("site")),
            levels=[LevelIR.from_dict(l) for l in data.get("levels", [])],
        )


# ============================================================================
# Top-level IR
# ============================================================================


@dataclass
class JsonIR:
    version: str
    libraries: list[LibraryIR] = field(default_factory=list)
    buildings: list[BuildingIR] = field(default_factory=list)

    def get_type(self, name: str) -> TypeIR | None:
        """Look up a type by name across all libraries."""
        for lib in self.libraries:
            t = lib.get_type(name)
            if t:
                return t
        return None

    def get_material(self, name: str) -> MaterialIR | None:
        """Look up a material by name across all libraries."""
        for lib in self.libraries:
            m = lib.get_material(name)
            if m:
                return m
        return None

    def resolve_type_inheritance(self, type_ir: TypeIR) -> TypeIR:
        """
        Resolve type inheritance, returning a flattened type with all inherited
        parameters.
        """
        if not type_ir.base_type:
            return type_ir

        base = self.get_type(type_ir.base_type)
        if not base:
            return type_ir

        # Recursively resolve base type
        resolved_base = self.resolve_type_inheritance(base)

        # Merge: child overrides parent
        merged_params = list(resolved_base.parameters)
        for param in type_ir.parameters:
            # Check if parameter already exists in base
            found = False
            for i, base_param in enumerate(merged_params):
                if base_param.name == param.name:
                    merged_params[i] = param
                    found = True
                    break
            if not found:
                merged_params.append(param)

        # Merge overrides
        merged_overrides = dict(resolved_base.overrides)
        merged_overrides.update(type_ir.overrides)

        return TypeIR(
            name=type_ir.name,
            base_type=type_ir.base_type,
            parameters=merged_params,
            overrides=merged_overrides,
            material=type_ir.material or resolved_base.material,
            ifc_class=type_ir.ifc_class or resolved_base.ifc_class,
        )

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            version=data["version"],
            libraries=[LibraryIR.from_dict(l) for l in data.get("libraries", [])],
            buildings=[BuildingIR.from_dict(b) for b in data.get("buildings", [])],
        )

    @classmethod
    def from_json(cls, json_str: str) -> Self:
        return cls.from_dict(json.loads(json_str))

    @classmethod
    def from_file(cls, path: str) -> Self:
        with open(path) as f:
            return cls.from_dict(json.load(f))
