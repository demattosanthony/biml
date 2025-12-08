"""Tests for BIM compiler (v0.3.0 hierarchical structure)."""

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
        assert simple_ir.version == "0.3.0"
        assert len(simple_ir.libraries) == 1
        assert len(simple_ir.projects) == 1

    def test_parse_library(self, simple_ir):
        lib = simple_ir.libraries[0]
        assert lib.name == "Doors"
        assert len(lib.families) == 1
        assert lib.families[0].name == "Door"
        assert len(lib.families[0].parameters) == 2

    def test_parse_types(self, simple_ir):
        lib = simple_ir.libraries[0]
        assert len(lib.types) == 1
        door_type = lib.types[0]
        assert door_type.name == "StandardDoor"
        assert door_type.family == "Door"
        assert len(door_type.parameters) == 2

    def test_get_type(self, simple_ir):
        door_type = simple_ir.get_type("StandardDoor")
        assert door_type is not None
        assert door_type.name == "StandardDoor"

        width = door_type.get_parameter("width")
        assert width is not None
        assert width.value == 900

    def test_parse_project(self, simple_ir):
        project = simple_ir.projects[0]
        assert project.name == "Simple Office"
        assert len(project.sites) == 1

    def test_parse_building_hierarchy(self, simple_ir):
        project = simple_ir.projects[0]
        site = project.sites[0]
        assert site.name == "Main Site"
        assert len(site.buildings) == 1

        building = site.buildings[0]
        assert building.name == "Office Building"
        assert len(building.levels) == 1

    def test_parse_level(self, simple_ir):
        level = simple_ir.projects[0].sites[0].buildings[0].levels[0]
        assert level.name == "Ground"
        assert level.elevation.value == 0
        assert level.height.value == 3.5
        assert len(level.spaces) == 2

    def test_parse_spaces(self, simple_ir):
        spaces = simple_ir.projects[0].sites[0].buildings[0].levels[0].spaces
        assert len(spaces) == 2

        reception = spaces[0]
        assert reception.name == "Reception"
        assert reception.position.row == 0
        assert reception.position.col == 0
        assert reception.area.value == 50
        assert len(reception.doors) == 1

        hallway = spaces[1]
        assert hallway.name == "Hallway"
        assert hallway.position.row == 0
        assert hallway.position.col == 1
        assert hallway.width.value == 2
        assert hallway.length.value == 10

    def test_parse_doors(self, simple_ir):
        door = simple_ir.projects[0].sites[0].buildings[0].levels[0].spaces[0].doors[0]
        assert door.name == "D1"
        assert door.type_ref == "StandardDoor"


class TestIFCGeneration:
    def test_generates_ifc_file(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        assert ifc is not None
        assert ifc.schema == "IFC4"

    def test_creates_project(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        projects = ifc.by_type("IfcProject")
        assert len(projects) == 1
        assert projects[0].Name == "Simple Office"

    def test_creates_site(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        sites = ifc.by_type("IfcSite")
        assert len(sites) == 1
        assert sites[0].Name == "Main Site"

    def test_creates_building(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        buildings = ifc.by_type("IfcBuilding")
        assert len(buildings) == 1
        assert buildings[0].Name == "Office Building"

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
        # 1 door in Reception
        assert len(openings) == 1
        assert len(doors) == 1
        assert doors[0].Name == "D1"

    def test_creates_door_type(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        door_types = ifc.by_type("IfcDoorType")
        assert len(door_types) == 1
        assert door_types[0].Name == "StandardDoor"

    def test_creates_type_relationship(self, simple_ir):
        ifc = compile_to_ifc(simple_ir)
        type_rels = ifc.by_type("IfcRelDefinesByType")
        # 1 door linked to its type
        assert len(type_rels) == 1

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

    def test_empty_projects_raises(self):
        ir = JsonIR(version="0.3.0", libraries=[], projects=[])
        with pytest.raises(ValueError, match="No projects"):
            compile_to_ifc(ir)
