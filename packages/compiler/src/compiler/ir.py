"""JSON IR types matching bim-lang output (v0.2.0 flat structure)."""

from dataclasses import dataclass
from typing import Self, Literal
import json


WallDirection = Literal["north", "south", "east", "west"]


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


@dataclass
class FloorIR:
    name: str
    elevation: MeasurementIR | None = None
    height: MeasurementIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            elevation=MeasurementIR(**data["elevation"]) if data.get("elevation") else None,
            height=MeasurementIR(**data["height"]) if data.get("height") else None,
        )


@dataclass
class RoomIR:
    name: str
    floor: str
    position: PositionIR
    area: MeasurementIR | None = None
    width: MeasurementIR | None = None
    length: MeasurementIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            floor=data["floor"],
            position=PositionIR.from_dict(data["position"]),
            area=MeasurementIR(**data["area"]) if data.get("area") else None,
            width=MeasurementIR(**data["width"]) if data.get("width") else None,
            length=MeasurementIR(**data["length"]) if data.get("length") else None,
        )


@dataclass
class DoorIR:
    from_room: str  # 'from' is a Python keyword, so we use from_room
    to: str  # Room name or "exterior"
    width: MeasurementIR | None = None
    height: MeasurementIR | None = None
    wall: WallDirection | None = None
    offset: float | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            from_room=data["from"],
            to=data["to"],
            width=MeasurementIR(**data["width"]) if data.get("width") else None,
            height=MeasurementIR(**data["height"]) if data.get("height") else None,
            wall=data.get("wall"),
            offset=data.get("offset"),
        )


@dataclass
class JsonIR:
    version: str
    floors: list[FloorIR]
    rooms: list[RoomIR]
    doors: list[DoorIR]

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            version=data["version"],
            floors=[FloorIR.from_dict(f) for f in data.get("floors", [])],
            rooms=[RoomIR.from_dict(r) for r in data.get("rooms", [])],
            doors=[DoorIR.from_dict(d) for d in data.get("doors", [])],
        )

    @classmethod
    def from_json(cls, json_str: str) -> Self:
        return cls.from_dict(json.loads(json_str))

    @classmethod
    def from_file(cls, path: str) -> Self:
        with open(path) as f:
            return cls.from_dict(json.load(f))
