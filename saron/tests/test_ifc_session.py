from saron.ifc_session import IfcSession

session = IfcSession()
session.create_new_ifc_project()

session.load_ifc_project_library("/Users/anthonydemattos/auto-bim/saron/blenderbim-site-library.ifc")

tree = session.get_ifc_project_library_tree()

print(tree)

session.load_library_element_by_guid(guid="0FMiZScTPFog7h7dFJ1g95")

session.create_instance(type_guid="0FMiZScTPFog7h7dFJ1g95", instance_name="Copied Crane", ifc_class="IfcBuildingElementProxy")

session.save()