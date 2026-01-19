"""JSON IR types for BIML v2.0."""

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
class Point3DIR:
    x: float
    y: float
    z: float

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(x=data["x"], y=data["y"], z=data["z"])


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
    op: str | None = None
    left: "ExpressionIR | None" = None
    right: "ExpressionIR | None" = None
    ref: list[str] | None = None
    condition: "ExpressionIR | None" = None
    then_expr: "ExpressionIR | None" = None
    else_expr: "ExpressionIR | None" = None
    operand: "ExpressionIR | None" = None
    name: str | None = None
    args: list["ExpressionIR"] | None = None

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
            op=data.get("op"),
            left=cls.from_dict(data.get("left")),
            right=cls.from_dict(data.get("right")),
            ref=data.get("ref"),
            condition=cls.from_dict(data.get("condition")),
            then_expr=cls.from_dict(data.get("then")),
            else_expr=cls.from_dict(data.get("else")),
            operand=cls.from_dict(data.get("operand")),
            name=data.get("name"),
            args=[cls.from_dict(a) for a in data.get("args", [])] if data.get("args") else None,
        )

    def evaluate(self, context: dict[str, Any] | None = None) -> float | bool | str | MeasurementIR:
        """Evaluate expression to a concrete value."""
        context = context or {}
        
        if self.kind == "literal":
            return self.value or 0
        elif self.kind == "measurement":
            return MeasurementIR(value=self.value or 0, unit=self.unit or "m")
        elif self.kind == "boolean":
            return self.bool_value or False
        elif self.kind == "string":
            return self.string_value or ""
        elif self.kind == "reference":
            if self.ref:
                # Look up in context
                key = ".".join(self.ref)
                return context.get(key, 0)
            return 0
        elif self.kind == "binary":
            left = self.left.evaluate(context) if self.left else 0
            right = self.right.evaluate(context) if self.right else 0
            
            # Handle measurements
            left_val = left.value if isinstance(left, MeasurementIR) else left
            right_val = right.value if isinstance(right, MeasurementIR) else right
            
            if self.op == "+":
                result = left_val + right_val
            elif self.op == "-":
                result = left_val - right_val
            elif self.op == "*":
                result = left_val * right_val
            elif self.op == "/":
                result = left_val / right_val if right_val != 0 else 0
            else:
                result = 0
            
            # Preserve unit if left was a measurement
            if isinstance(left, MeasurementIR):
                return MeasurementIR(value=result, unit=left.unit)
            return result
        elif self.kind == "unary":
            operand = self.operand.evaluate(context) if self.operand else 0
            if self.op == "-":
                if isinstance(operand, MeasurementIR):
                    return MeasurementIR(value=-operand.value, unit=operand.unit)
                return -operand
            return operand
        elif self.kind == "conditional":
            cond = self.condition.evaluate(context) if self.condition else False
            if cond:
                return self.then_expr.evaluate(context) if self.then_expr else 0
            return self.else_expr.evaluate(context) if self.else_expr else 0
        
        return 0


# ============================================================================
# Geometry IR
# ============================================================================

@dataclass
class ProfileIR:
    kind: str
    width: ExpressionIR | None = None
    depth: ExpressionIR | None = None
    radius: ExpressionIR | None = None
    flange: ExpressionIR | None = None
    web: ExpressionIR | None = None
    points: list[Point2DIR] | None = None

    @classmethod
    def from_dict(cls, data: dict | None) -> Self | None:
        if data is None:
            return None
        return cls(
            kind=data["kind"],
            width=ExpressionIR.from_dict(data.get("width")),
            depth=ExpressionIR.from_dict(data.get("depth")),
            radius=ExpressionIR.from_dict(data.get("radius")),
            flange=ExpressionIR.from_dict(data.get("flange")),
            web=ExpressionIR.from_dict(data.get("web")),
            points=[Point2DIR.from_dict(p) for p in data.get("points", [])] if data.get("points") else None,
        )


@dataclass
class GeometryIR:
    kind: str
    width: ExpressionIR | None = None
    depth: ExpressionIR | None = None
    height: ExpressionIR | None = None
    radius: ExpressionIR | None = None
    profile: ProfileIR | None = None
    left: "GeometryIR | None" = None
    right: "GeometryIR | None" = None
    ref: str | None = None

    @classmethod
    def from_dict(cls, data: dict | None) -> Self | None:
        if data is None:
            return None
        return cls(
            kind=data["kind"],
            width=ExpressionIR.from_dict(data.get("width")),
            depth=ExpressionIR.from_dict(data.get("depth")),
            height=ExpressionIR.from_dict(data.get("height")),
            radius=ExpressionIR.from_dict(data.get("radius")),
            profile=ProfileIR.from_dict(data.get("profile")),
            left=cls.from_dict(data.get("left")),
            right=cls.from_dict(data.get("right")),
            ref=data.get("ref"),
        )


# ============================================================================
# Material IR
# ============================================================================

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


# ============================================================================
# Family & Type IR
# ============================================================================

@dataclass
class ParameterIR:
    name: str
    type: str
    default_value: ExpressionIR | None = None
    min_value: ExpressionIR | None = None
    max_value: ExpressionIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            type=data["type"],
            default_value=ExpressionIR.from_dict(data.get("defaultValue")),
            min_value=ExpressionIR.from_dict(data.get("min")),
            max_value=ExpressionIR.from_dict(data.get("max")),
        )


@dataclass
class FamilyIR:
    name: str
    parameters: list[ParameterIR] = field(default_factory=list)
    geometry: GeometryIR | None = None
    opening: GeometryIR | None = None
    properties: dict[str, ExpressionIR] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            parameters=[ParameterIR.from_dict(p) for p in data.get("parameters", [])],
            geometry=GeometryIR.from_dict(data.get("geometry")),
            opening=GeometryIR.from_dict(data.get("opening")),
            properties={k: ExpressionIR.from_dict(v) for k, v in data.get("properties", {}).items()},
        )


@dataclass
class TypeIR:
    name: str
    base_family: str | None = None
    base_type: str | None = None
    parameters: dict[str, ExpressionIR] = field(default_factory=dict)
    geometry: GeometryIR | None = None
    opening: GeometryIR | None = None
    material: str | None = None
    ifc_class: str | None = None
    properties: dict[str, ExpressionIR] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            base_family=data.get("baseFamily"),
            base_type=data.get("baseType"),
            parameters={k: ExpressionIR.from_dict(v) for k, v in data.get("parameters", {}).items()},
            geometry=GeometryIR.from_dict(data.get("geometry")),
            opening=GeometryIR.from_dict(data.get("opening")),
            material=data.get("material"),
            ifc_class=data.get("ifcClass"),
            properties={k: ExpressionIR.from_dict(v) for k, v in data.get("properties", {}).items()},
        )

    def get_parameter(self, name: str) -> MeasurementIR | float | bool | str | None:
        """Get a resolved parameter value."""
        expr = self.parameters.get(name)
        if expr:
            result = expr.evaluate()
            return result
        return None


@dataclass
class LibraryIR:
    name: str
    materials: list[MaterialIR] = field(default_factory=list)
    families: list[FamilyIR] = field(default_factory=list)
    types: list[TypeIR] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            materials=[MaterialIR.from_dict(m) for m in data.get("materials", [])],
            families=[FamilyIR.from_dict(f) for f in data.get("families", [])],
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

    def get_family(self, name: str) -> FamilyIR | None:
        for f in self.families:
            if f.name == name:
                return f
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
    aligned_with: str | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            start=Point2DIR.from_dict(data["start"]),
            end=Point2DIR.from_dict(data["end"]),
            thickness=MeasurementIR.from_dict(data.get("thickness")),
            height=MeasurementIR.from_dict(data.get("height")),
            material=data.get("material"),
            aligned_with=data.get("alignedWith"),
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
    profile: ProfileIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            position=Point2DIR.from_dict(data["position"]),
            type_ref=data.get("typeRef"),
            width=MeasurementIR.from_dict(data.get("width")),
            depth=MeasurementIR.from_dict(data.get("depth")),
            height=MeasurementIR.from_dict(data.get("height")),
            profile=ProfileIR.from_dict(data.get("profile")),
        )


@dataclass
class FurnitureSizeIR:
    width: MeasurementIR
    depth: MeasurementIR

    @classmethod
    def from_dict(cls, data: dict | None) -> Self | None:
        if data is None:
            return None
        return cls(
            width=MeasurementIR.from_dict(data["width"]),
            depth=MeasurementIR.from_dict(data["depth"]),
        )


@dataclass
class FurnitureIR:
    type_ref: str
    position: Point2DIR
    name: str | None = None
    facing: str | None = None
    rotation: MeasurementIR | None = None
    size: FurnitureSizeIR | None = None
    count: int | None = None
    spacing: MeasurementIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            type_ref=data["typeRef"],
            position=Point2DIR.from_dict(data["position"]),
            name=data.get("name"),
            facing=data.get("facing"),
            rotation=MeasurementIR.from_dict(data.get("rotation")),
            size=FurnitureSizeIR.from_dict(data.get("size")),
            count=data.get("count"),
            spacing=MeasurementIR.from_dict(data.get("spacing")),
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
            bounded_by=[WallReferenceIR.from_dict(w) for w in data.get("boundedBy", [])] if data.get("boundedBy") else None,
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

    def get_family(self, name: str) -> FamilyIR | None:
        """Look up a family by name across all libraries."""
        for lib in self.libraries:
            f = lib.get_family(name)
            if f:
                return f
        return None

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
