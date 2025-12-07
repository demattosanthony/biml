"""Tests for BIM compiler (v0.2.0 flat structure)."""

import pytest
from pathlib import Path
from compiler.ir import JsonIR
from compiler.ifc import compile_to_ifc

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def simple_ir():
    return JsonIR.from_file(FIXTURES / "simple.json")


class TestIR:
    def test_parse_simple_json(self, simple_ir):
        assert simple_ir.version == "0.2.0"
        assert len(simple_ir.floors) == 1
        assert len(simple_ir.rooms) == 2
        assert len(simple_ir.doors) == 1

    def test_parse_floor(self, simple_ir):
        floor = simple_ir.floors[0]
        assert floor.name == "Ground"
        assert floor.elevation.value == 0
        assert floor.height.value == 3.5

    def test_parse_rooms(self, simple_ir):
        rooms = simple_ir.rooms
        assert len(rooms) == 2

        reception = rooms[0]
        assert reception.name == "Reception"
        assert reception.floor == "Ground"
        assert reception.position.row == 0
        assert reception.position.col == 0
        assert reception.area.value == 50

        hallway = rooms[1]
        assert hallway.name == "Hallway"
        assert hallway.floor == "Ground"
        assert hallway.position.row == 0
        assert hallway.position.col == 1
        assert hallway.width.value == 2
        assert hallway.length.value == 10

    def test_parse_doors(self, simple_ir):
        door = simple_ir.doors[0]
        assert door.from_room == "Reception"
        assert door.to == "Hallway"
        assert door.width.value == 1.2


class TestIFCGeneration:
    def test_generates_ifc_file(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        assert ifc is not None
        assert ifc.schema == "IFC4"

    def test_creates_project(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        projects = ifc.by_type("IfcProject")
        assert len(projects) == 1
        assert projects[0].Name == "Building"

    def test_creates_storey(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        storeys = ifc.by_type("IfcBuildingStorey")
        assert len(storeys) == 1
        assert storeys[0].Name == "Ground"
        assert storeys[0].Elevation == 0.0

    def test_creates_walls_and_slabs(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        walls = ifc.by_type("IfcWall")
        slabs = ifc.by_type("IfcSlab")
        # With shared wall handling, we should have fewer walls
        # 2 rooms adjacent = 7 walls (3 exterior each + 1 shared)
        assert len(walls) == 7
        # 1 floor slab per room × 2 rooms = 2 slabs
        assert len(slabs) == 2
        assert any("Reception - Floor" in s.Name for s in slabs)
        assert any("Hallway - Floor" in s.Name for s in slabs)

    def test_creates_door_opening(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        openings = ifc.by_type("IfcOpeningElement")
        doors = ifc.by_type("IfcDoor")
        # 1 door = 1 opening + 1 door entity
        assert len(openings) == 1
        assert len(doors) == 1
        assert "Reception" in openings[0].Name
        assert "Hallway" in openings[0].Name
        assert "Reception" in doors[0].Name
        assert "Hallway" in doors[0].Name

    def test_creates_void_relationship(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        voids = ifc.by_type("IfcRelVoidsElement")
        # 1 door opening creates 1 void relationship
        assert len(voids) == 1

    def test_creates_fill_relationship(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        fills = ifc.by_type("IfcRelFillsElement")
        # 1 door fills 1 opening
        assert len(fills) == 1

    def test_empty_floors_raises(self):
        ir = JsonIR(version="0.2.0", floors=[], rooms=[], doors=[])
        with pytest.raises(ValueError, match="No floors"):
            compile_to_ifc(ir)
