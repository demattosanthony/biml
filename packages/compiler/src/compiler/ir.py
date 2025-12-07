"""JSON IR types matching bim-lang output."""

from dataclasses import dataclass
from typing import Self
import json


@dataclass
class MeasurementIR:
    value: float
    unit: str


@dataclass
class DoorIR:
    target: str
    width: MeasurementIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            target=data["target"],
            width=MeasurementIR(**data["width"]) if data.get("width") else None,
        )


@dataclass
class RoomIR:
    name: str
    doors: list[DoorIR]
    area: MeasurementIR | None = None
    width: MeasurementIR | None = None
    length: MeasurementIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            doors=[DoorIR.from_dict(d) for d in data.get("doors", [])],
            area=MeasurementIR(**data["area"]) if data.get("area") else None,
            width=MeasurementIR(**data["width"]) if data.get("width") else None,
            length=MeasurementIR(**data["length"]) if data.get("length") else None,
        )


@dataclass
class FloorIR:
    name: str
    rooms: list[RoomIR]
    elevation: MeasurementIR | None = None
    height: MeasurementIR | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            rooms=[RoomIR.from_dict(r) for r in data.get("rooms", [])],
            elevation=MeasurementIR(**data["elevation"]) if data.get("elevation") else None,
            height=MeasurementIR(**data["height"]) if data.get("height") else None,
        )


@dataclass
class ProjectIR:
    name: str
    floors: list[FloorIR]

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            name=data["name"],
            floors=[FloorIR.from_dict(f) for f in data.get("floors", [])],
        )


@dataclass
class JsonIR:
    version: str
    projects: list[ProjectIR]

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            version=data["version"],
            projects=[ProjectIR.from_dict(p) for p in data.get("projects", [])],
        )

    @classmethod
    def from_json(cls, json_str: str) -> Self:
        return cls.from_dict(json.loads(json_str))

    @classmethod
    def from_file(cls, path: str) -> Self:
        with open(path) as f:
            return cls.from_dict(json.load(f))
