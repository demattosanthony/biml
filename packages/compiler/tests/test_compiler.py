"""Tests for BIM compiler."""

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
        assert simple_ir.version == "0.1.0"
        assert len(simple_ir.projects) == 1
        assert simple_ir.projects[0].name == "Test Building"

    def test_parse_floor(self, simple_ir):
        floor = simple_ir.projects[0].floors[0]
        assert floor.name == "Level 1"
        assert floor.elevation.value == 0
        assert floor.height.value == 3.5

    def test_parse_rooms(self, simple_ir):
        rooms = simple_ir.projects[0].floors[0].rooms
        assert len(rooms) == 2
        assert rooms[0].name == "Reception"
        assert rooms[0].area.value == 50
        assert rooms[1].name == "Hallway"
        assert rooms[1].width.value == 2


class TestIFCGeneration:
    def test_generates_ifc_file(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        assert ifc is not None
        assert ifc.schema == "IFC4"

    def test_creates_project(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        projects = ifc.by_type("IfcProject")
        assert len(projects) == 1
        assert projects[0].Name == "Test Building"

    def test_creates_storey(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        storeys = ifc.by_type("IfcBuildingStorey")
        assert len(storeys) == 1
        assert storeys[0].Name == "Level 1"
        assert storeys[0].Elevation == 0.0

    def test_creates_walls(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        walls = ifc.by_type("IfcWall")
        assert len(walls) == 2
        assert {w.Name for w in walls} == {"Reception", "Hallway"}

    def test_empty_projects_raises(self):
        ir = JsonIR(version="0.1.0", projects=[])
        with pytest.raises(ValueError, match="No projects"):
            compile_to_ifc(ir)
