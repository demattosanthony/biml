IfcOpenShell 0.8.0 documentation

## Introduction

IfcOpenShell is an open source software library for software developers and BIM powerusers working with Industry Foundation Classes (IFC).

In addition to a C++ and Python API, IfcOpenShell comes with an ecosystem of tools, notably including IfcConvert (an application to convert IFC models to other formats), Bonsai (an add-on to Blender providing a graphical IFC authoring platform), and many other libraries, CLI apps, and more. Support is also provided for auxiliary standards such as BCF, bSDD, and IDS.

Things you can do

IfcOpenShell is designed to be a complete BIM authoring platform. Its capabilities have a similar scope to other BIM libraries, modeling platforms, costing programs, scheduling software, CAD packages, and simulation software. It is too numerous to list in full, but an example of what is possible include: Viewing models, including spaces, properties, and relationships, Edit and extract attributes and properties, Moving objects, and changing their geometry, Create new objects using library elements, Manage classification systems, document and library references, Generating 2D drawings, schedules, and creating sheets, Investigating and editing structural analysis models, Connecting and managing distribution systems and ports, Creating construction schedules, critical path analysis, and generating sequence animations, Creating cost schedules, using formulas, and deriving quantities from model elements, Clash detection and managing issues for model coordination

## Introduction to BIM

Building Information Modeling, or BIM, is a way of digitally describing our built environment to computers. Aspects of our built environment that can be described are: Products, like walls, doors, and windows, Processes, like construction or maintenance tasks, and procedures, Resources, like labour, materials, and equipment, Controls, like permits, orders, costs, or calendar availability, Actors, like occupants, clients, architects, and liable parties, Groups, like systems, inventories, or zones, These objects may have lots of data and relationships. Examples of data might be classification systems, physical materials, associated documents, simulation results, and construction types. The data may be relevant to multiple disciplines, such as architecture, engineering, and construction.

Note
BIM data is very different from a regular 3D model. In fact, geometry is optional, and most data is non-geometric. This means that it is not simply a 3D format that you can import or export from and expect meaningful results.

Industry Foundation Classes, or IFC, is an international standard for BIM. IFC is the most well-established open digital language for our built environment. Most software will be able to describe their BIM data using IFC. Most commonly, IFC models will be shared as a .ifc file.

For example, IFC will define a wall as an object that can have a name, construction type, and quantities. IFC will also describe that a wall that be associated with a location, like a building storey, or have an associated cost item in a schedule.

When you use IfcOpenShell, you will be able to view and create BIM objects and relationships using the IFC standard.

An IFC model is a collection of elements (e.g. doors, windows, construction tasks, materials, etc) with relationships to other elements in a graph-like database. Together, these elements and their relationships describe the digital built environment.

Each element has a type known as an IFC Class. These classes define the attributes that the element may store. For example, the IfcWall Class is allowed to store a Name and Description attribute.

This IFC database can be stored in many formats. The most common is the .ifc format, which stores data in plain text. If you open a .ifc file in a text editor, you’ll see something like this:

#1=IFCPROJECT('3Cbhu4euf1hfgM*SHZbeqM',$,'My Project',$,$,$,$,$,#4);
#2=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);
#3=IFCSIUNIT(\_,.AREAUNIT.,$,.SQUARE_METRE.);
#4=IFCUNITASSIGNMENT((#2,#3));
#5=IFCCARTESIANPOINT((0.,0.,0.));

In this example there are 5 elements in the graph. The element with the ID of #1 has an IFC Class of IfcProject. This element has 9 comma-separated attributes. IFC defines how many attributes each IFC Class is allowed to have, attribute names, the order of attributes, data type, optional or mandatory status (i.e. cardinality), and more.

IFC Class Quoted string value Null value ID reference
↓ ↓ ↓ ↓
#1=IFCPROJECT('3Cbhu4euf1hfgM_SHZbeqM',$,'My Project',$,$,$,$,$,#4);
↑ ↑
Element ID Comma-separated list of attributes

By selecting elements by their IFC Class, and reading their attributes, you can navigate from one element to another. The relationships between elements are called IFC Concepts and create meaning in our industry. For example, if a IfcWall element has an attribute that references an IfcBuildingStorey element in a particular way, it will mean that the wall is located in the ground floor of the building.

The official IFC documentation describes hundreds of IFC Classes, ranging from walls, door, to tasks, cost items, parametric materials, and structural analysis constraints. There are also hundreds of IFC Concepts, which may describe how a wall is in a storey, a construction task might occur one after another, or how an surface bounds a space for energy analysis.

It takes time to learn the many IFC Classes and IFC Concepts available. Once you do, you will be able to richly describe our built environment digitally. IfcOpenShell can help you navigate these IFC elements, read their attributes, and explore relationships. Your journey begins here.

See also

If you are already familiar with IFC and just want to learn how to use IfcOpenShell, you can jump to the `Core functionality crash course`\_.

Begin learning IFC

IFC has three versions published by ISO: IFC2X3 from 2007, IFC4 from 2017, and IFC4X3 in draft form. Each version improves on the previous version, and will have different IFC Classes with different attributes and different IFC Concepts.

You can access the official documentation here:

Official IFC2X3 documentation homepage

Official IFC4 documentation homepage

Official IFC4X3 documentation homepage

List of all IFC2X3 classes

List of all IFC4 classes

List of all IFC4X3 classes

Tip

It is recommended to use IFC4. However, the IFC4X3 documentation is a lot more friendly to newcomers.

The official ISO documentation is written for a technical audience and may be overwhelming. This guide will take you slowly through the core concepts, and leave you with the knowledge you need to discover more.

Before digging into theory, let’s explore an existing IFC model. You can download this sample IFC for this guide.

Download sample IFC

If you open up the model with a text editor, you will see text similar to this:

ISO-10303-21;
HEADER;FILE_DESCRIPTION(('ViewDefinition [, QuantityTakeOffAddOnView, SpaceBoundary2ndLevelAddOnView]'),'2;1');
FILE_NAME('AC20-FZK-Haus.ifc','2016-12-21T17:54:06',('Architect'),(''),'','','');
FILE_SCHEMA(('IFC4'));
ENDSEC;

DATA;
#3= IFCORGANIZATION($,'Nicht definiert',$,$,$);
#12= IFCOWNERHISTORY(#7,#11,$,.ADDED.,$,$,$,1482339244);
#13= IFCSIUNIT(_,.LENGTHUNIT.,$,.METRE.);
#14= IFCSIUNIT(_,.AREAUNIT.,$,.SQUARE_METRE.);

...

#62= IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.00000000000E-5,#59,#60);
#66= IFCPROJECT('0lY6P5Ur90TAQnnnI6wtnb',#12,'Projekt-FZK-Haus','Projekt FZK-House create by KHH Forschuungszentrum Karlsruhe',$,$,$,(#62,#374),#49);
#77= IFCPROPERTYSINGLEVALUE('GS_TimeStamp',$,IFCTIMESTAMP(9685146),$);
#85= IFCPROPERTYSET('1mnk_H9cG6eU2r9ped0WRu',#12,'GSPset_TimeStamp',$,(#77));

...

#15033= IFCSHAPEREPRESENTATION(#15026,'Axis','Curve2D',(#15031));
#15037= IFCPRODUCTDEFINITIONSHAPE($,$,(#15016,#15024,#15033));
#15042= IFCWALLSTANDARDCASE('2XPyKWY018sA1ygZKgQPtU',#12,'Wand-Int-ERDG-4',$,$,#14983,#15037,'BC6F0F70-6195-495E-A2-FC-239713029DB1',$);
#15046= IFCMATERIAL('Leichtbeton 102890359',$,$);

...

#15231= IFCRELDEFINESBYPROPERTIES('3Q0nMR5elnJFWzAhgkZqe1',#12,$,$,(#15042),#15229);
#15234= IFCWALLTYPE('2AEMyYvIjlsz7LRzqYHy64',#12,'Leichtbeton 102890359 240',$,$,$,(#15244,#15248,#15250,#17288,#17290,#17292,#18637,#18639,#18641,#19015,#19017,#19019,#20770,#20772,#20774),'8A396F22-E52B-6FDB-D1D5-6FDD2247C184',$,.NOTDEFINED.);
#15237= IFCDIRECTION((1.,0.,0.));
#15239= IFCDIRECTION((0.,0.,1.));

... etc

The first thing you should notice is the line that defines that this is an IFC4 version. This determines what IFC Classes and IFC Concepts are available.

FILE_SCHEMA(('IFC4'));

You’ll notice certain IFC Class keywords jump out at you: things like IFCSIUNIT which defines the length unit of metres, or IFCPROJECT which defines the project, or IFCPROPERTYSINGLEVALUE which defines a property of something, or IFCWALLSTANDARDCASE which defines a wall, or IFCMATERIAL which defines a material, and so on.

Let’s see how to fetch this data with code. Let’s start with loading the model. Import the IfcOpenShell module, then use the open function to load the model into a variable called model. The first piece of information we want to check is what IFC schema version we are using. We assume the model you are learning with is IFC4. We’ll then fetch all entities that use the IfcSlab class.

import ifcopenshell
model = ifcopenshell.open('/path/to/your/model.ifc')
print(model.schema) # May return IFC2X3, IFC4, or IFC4X3.
print(model.by_type("IfcSlab")) # Will return a list of IFCSLAB entities, like below:

# [

# #34509=IfcSlab('1pPHnf7cXCpPsNEnQf8_6B',#12,'Bodenplatte',$,$,#34464,#34505,'E4D9CD4B-CA43-4735-94-BD-1FD4376BD455',.BASESLAB.),

# #59290=IfcSlab('2RGlQk4xH47RHK93zcTzUL',#12,'Slab-033',$,$,#59253,#59286,'DA0A17AC-B773-47AC-99-C5-D390C73AD5CC',.FLOOR.),

# #59553=IfcSlab('07Enbsqm9C7AQC9iyBwfSD',#12,'Dach-1',$,$,#59508,#59549,'E142B455-80E4-4B96-83-EC-E1589CA998DB',.ROOF.),

# #59753=IfcSlab('2IxUUNUVPB6Ob$eicCfP2N',#12,'Dach-2',$,$,#59716,#59749,'BD6D9414-37DF-40A8-88-40-301A32A9A5B5',.ROOF.)

# ]

Tip

Try changing model.by_type("IfcSlab") to fetch different types of entities based on their IFC Class.

An overview of all IFC classes

There are hundreds of IFC Classes. You don’t need to know them all, but we’ll help describe the general breakdown so you know where to find the appropriate class for what you’re after.

IFC Classes are defined using an Object Oriented tree hierarchy. Child IFC Classes inherit the attributes defined by the parent IFC Class. This means that IFC Classes with common attributes are grouped together in the tree.

For example, because all IfcObject classes can have a GlobalId attribute, that means that because IfcWall is a subtype of IfcObject, it can also have a GlobalId attribute.

If you’re reading this, we assume you already know IFC and just want to quickly get started with IfcOpenShell.

This crash course guides you through basic code snippets that give you a general idea of the low-level functionality that IfcOpenShell-python provides. You’ll need to have IfcOpenShell installed and a sample IFC model. To get the most out of it, try out the code yourself and see what results you get!

If you don’t have an IFC model available, here’s a small one for your convenience provided by the Institute for Automation and Applied Informatics (IAI) / Karlsruhe Institute of Technology. It’s in German, so you may need to use some creativity when reading the data :)

Download sample IFC

See also

You can find more sample models online in the OSArch Open Data Directory

Let’s start with loading the model. Import the IfcOpenShell module, then use the open function to load the model into a variable called model.

import ifcopenshell
model = ifcopenshell.open('/path/to/your/model.ifc')

Let’s see what IFC schema we are using:

print(model.schema) # May return IFC2X3, IFC4, or IFC4X3.

Let’s get the first piece of data in our IFC file:

print(model.by_id(1))

But getting data from beginning to end isn’t too meaningful to humans. What if we knew a GlobalId value instead?

print(model.by_guid('0EI0MSHbX9gg8Fxwar7lL8'))

If we’re not looking specifically for a single element, perhaps let’s see how many walls are in our file, and count them:

walls = model.by_type('IfcWall')
print(len(walls))

Once we have an element, we can see what IFC class it is:

wall = model.by_type('IfcWall')[0]
print(wall.is_a()) # Returns 'IfcWall'

You can also test if it is a certain class, as well as check for parent classes too:

print(wall.is_a('IfcWall')) # Returns True
print(wall.is_a('IfcElement')) # Returns True
print(wall.is_a('IfcWindow')) # Returns False

Let’s quickly check the STEP ID of our element:

print(wall.id())

Let’s get some attributes of an element. IFC attributes have a particular order. We can access it just like a list, so let’s get the first and third attribute:

print(wall[0]) # The first attribute is the GlobalId
print(wall[2]) # The third attribute is the Name

Knowing the order of attributes is boring and technical. We can access them by name too:

print(wall.GlobalId)
print(wall.Name)

Getting attributes one by one is tedious. Let’s grab them all:

# Gives us a dictionary of attributes, such as:

# {'id': 8, 'type': 'IfcWall', 'GlobalId': '2_qMTAIHrEYu0vYcqK8cBX', ... }

print(wall.get_info())

Let’s see all the properties and quantities associated with this wall:

import ifcopenshell.util
import ifcopenshell.util.element
print(ifcopenshell.util.element.get_psets(wall))

Some attributes are special, called “inverse attributes”. They happen when another element is referencing our element. They can reference it for many reasons, like to define a relationship, such as if they create a void in our wall, join our wall, or define a quantity take-off value for our wall, among others. Just treat them like regular attributes:

print(wall.IsDefinedBy)

Perhaps we want to see all elements which are referencing our wall?

print(model.get_inverse(wall))

Let’s do the opposite, let’s see all the elements which our wall references instead:

print(model.traverse(wall))

# Or, let's just go down one level deep

print(model.traverse(wall, max_levels=1))

If you want to modify data, just assign it to the relevant attribute:

wall.Name = 'My new wall name'

You can also generate a new GlobalId:

wall.GlobalId = ifcopenshell.guid.new()

After modifying some IFC data, you can save it to a new IFC-SPF file:

model.write('/path/to/a/new.ifc')

You can generate a new IFC from scratch too, instead of reading an existing one:

ifc = ifcopenshell.file()

# Or if you want a particular schema:

ifc = ifcopenshell.file(schema='IFC4')

You can create new IFC elements, and add it either to an existing or newly created IFC file object:

# Will return #1=IfcWall($,$,$,$,$,$,$,$,$) - notice all of the attributes are blank!

new_wall = model.createIfcWall()

# Will return a list with our wall in it: [#1=IfcWall($,$,$,$,$,$,$,$,$)]

print(model.by_type('IfcWall'))

Alternatively, you can also use this way to create new elements:

model.create_entity('IfcWall')

Specifying more arguments lets you fill in attributes while creating the element instead of assigning them separately. You specify them in the order of the attributes.

# Gives us #1=IfcWall('0EI0MSHbX9gg8Fxwar7lL8',$,$,$,$,$,$,$,$)

model.create_entity('IfcWall', ifcopenshell.guid.new())

Again, knowing the order of attributes is difficult, so you can use keyword arguments instead:

# Gives us #1=IfcWall('0EI0MSHbX9gg8Fxwar7lL8',$,'Wall Name',$,$,$,$,$,$)

model.create_entity('IfcWall', GlobalId=ifcopenshell.guid.new(), Name='Wall Name')

Sometimes, it’s easier to expand a dictionary:

data = {
'GlobalId': ifcopenshell.guid.new(),
'Name': 'Wall Name'
}
model.create_entity('IfcWall', \*\*data)

Some attributes of an element aren’t just text, they may be a reference to another element. Easy:

wall = model.createIfcWall()
wall.OwnerHistory = model.createIfcOwnerHistory()

What if we already have an element from one IFC file and want to add it to another?

wall = model.by_type('IfcWall')[0]
new_model = ifcopenshell.file()
new_model.add(wall)

Fed up with an object? Let’s delete it:

model.remove(wall)

This is only a small sample of the basic building blocks of manipulating IFC data. IFC comes with a huge utility library and API for performing common tasks. See Code examples for more.

Examples for common basic tasks are shown here. In all examples, it is assumed that you have a IFC model loaded into model variable like so:

import ifcopenshell

model = ifcopenshell.open('model.ifc')

This is only a small sample of common tasks. To view the full list of available functions, check out the API Reference.

Get all wall types
for wall_type in model.by_type("IfcWallType"):
print("The wall type element is", wall_type)
print("The name of the wall type is", wall_type.Name)

Get all door occurrences of a type
import ifcopenshell.util.element

for door_type in model.by_type("IfcDoorType"):
print("The door type is", door_type.Name)
doors = ifcopenshell.util.element.get_types(door_type)
print(f"There are {len(doors)} of this type")
for door in doors:
print("The door name is", door.Name)

Get the type of a wall
import ifcopenshell.util.element

wall = model.by_type("IfcWall")[0]
wall_type = ifcopenshell.util.element.get_type(wall)
print(f"The wall type of {wall.Name} is {wall_type.Name}")

Get the properties of a wall type
import ifcopenshell.util.element

wall = model.by_type("IfcWall")[0]
wall_type = ifcopenshell.util.element.get_type(wall)

# Get all properties and quantities as a dictionary

# returns {"Pset_WallCommon": {"id": 123, "FireRating": "2HR", ...}}

psets = ifcopenshell.util.element.get_psets(wall_type)
print(psets)

# Get all properties and quantities of the wall, including inherited type properties

psets = ifcopenshell.util.element.get_psets(wall)
print(psets)

# Get only properties and not quantities

print(ifcopenshell.util.element.get_psets(wall, psets_only=True))

# Get only quantities and not properties

print(ifcopenshell.util.element.get_psets(wall, qtos_only=True))

Find the spatial container of an element
import ifcopenshell.util.element

wall = model.by_type("IfcWall")[0]

# Walls are typically located on a storey, equipment might be located in spaces, etc

container = ifcopenshell.util.element.get_container(wall)

# The wall is located on Level 01

print(f"The wall is located on {container.Name}")

Get all elements in a container
import ifcopenshell.util.element

for storey in model.by_type("IfcBuildingStorey"):
elements = ifcopenshell.util.element.get_decomposition(storey)
print(f"There are {len(elements)} located on storey {storey.Name}, they are:")
for element in elements:
print(element.Name)

Get the XYZ coordinates of a element
import ifcopenshell.util.placement

wall = model.by_type("IfcWall")[0]

# This returns a 4x4 matrix, including the location and rotation. For example:

# array([[ 1.00000000e+00, 0.00000000e+00, 0.00000000e+00, 2.00000000e+00],

# [ 0.00000000e+00, 1.00000000e+00, 0.00000000e+00, 3.00000000e+00],

# [ 0.00000000e+00, 0.00000000e+00, 1.00000000e+00, 5.00000000e+00],

# [ 0.00000000e+00, 0.00000000e+00, 0.00000000e+00, 1.00000000e+00]])

matrix = ifcopenshell.util.placement.get_local_placement(wall.ObjectPlacement)

# The last column holds the XYZ values, such as:

# array([ 2.00000000e+00, 3.00000000e+00, 5.00000000e+00])

print(matrix[:,3][:3])

Get the geometry of an element

See Geometry processing for details.

Get the classification of an element
import ifcopenshell.util.classification

wall = model.by_type("IfcWall")[0]

# Elements may have multiple classification references assigned

references = ifcopenshell.util.classification.get_references(wall)
for reference in references: # A reference code might be Pr_30_59_99_02
print("The wall has a classification reference of", reference[1]) # A system might be Uniclass 2015
system = ifcopenshell.util.classification.get_classification(reference)
print("This reference is part of the system", system.Name)

Convert to and from SI units and project units
import ifcopenshell.util.unit

# Note: ifc_project_length is a value you have extracted from the project,

# just as from a quantity set.

unit_scale = ifcopenshell.util.unit.calculate_unit_scale(model)

# Convert to SI unit:

si_meters = ifc_project_length \* unit_scale

# Convert from SI unit:

ifc_project_length = si_meters / unit_scale

Get the distribution system of an element
import ifcopenshell.util.classification

pipe = model.by_type("IfcPipeSegment")[0]

# Elements may be assigned to multiple systems simultaneously, such as electrical, hydraulic, etc

systems = ifcopenshell.util.system.get_element_systems(pipe)
for system in systems: # For example, it might be part of a Chilled Water system
print("This pipe is part of the system", system.Name)

Copy an entity instance

Copy an entity instance is possible in different ways, depending on the task.

import ifcopenshell.api.root

wall_copy_class = ifcopenshell.api.root.copy_class(model, product = wall)

This is high level and makes sensible assumptions about copying things like properties and quantities. It does not copy the element’s representation, however.

import ifcopenshell.util.element

wall_shallow_copy = ifcopenshell.util.element.copy(model, wall)

This is for shallow copies. That is, associated things like the element’s type, materials, and properties are not copied. The new element, however, has the same representation and placement as the original.

import ifcopenshell.util.element

wall_deepgraph_copy = ifcopenshell.util.element.copy_deep(model, wall, exclude = None)

This is for deep graph copy. Like shallow copy, it does not copy over things like associated type/properties/quantities, but it does copy the representation and placement.

Also note that ifcopenshell.file.add() can be used to copy instances from one file to the other.

f = ifcopenshell.open(...)
g = ifcopenshell.file(schema=f.schema)
g.add(f.by_type(...)[0])

Note that, in this case, it does copy over recursively, however, it does not make any other attempts at resulting in a valid file. Factor in things like length unit conversion if both files (f and g) have project length unit defined.

Create a simple model from scratch
import ifcopenshell.api.root
import ifcopenshell.api.unit
import ifcopenshell.api.context
import ifcopenshell.api.project
import ifcopenshell.api.spatial
import ifcopenshell.api.geometry
import ifcopenshell.api.aggregate

# Create a blank model

model = ifcopenshell.api.project.create_file()

# All projects must have one IFC Project element

project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject", name="My Project")

# Geometry is optional in IFC, but because we want to use geometry in this example, let's define units

# Assigning without arguments defaults to metric units

ifcopenshell.api.unit.assign_unit(model)

# Let's create a modeling geometry context, so we can store 3D geometry (note: IFC supports 2D too!)

context = ifcopenshell.api.context.add_context(model, context_type="Model")

# In particular, in this example we want to store the 3D "body" geometry of objects, i.e. the body shape

body = ifcopenshell.api.context.add_context(model, context_type="Model",
context_identifier="Body", target_view="MODEL_VIEW", parent=context)

# Create a site, building, and storey. Many hierarchies are possible.

site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite", name="My Site")
building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding", name="Building A")
storey = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey", name="Ground Floor")

# Since the site is our top level location, assign it to the project

# Then place our building on the site, and our storey in the building

ifcopenshell.api.aggregate.assign_object(model, relating_object=project, products=[site])
ifcopenshell.api.aggregate.assign_object(model, relating_object=site, products=[building])
ifcopenshell.api.aggregate.assign_object(model, relating_object=building, products=[storey])

# Let's create a new wall

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Give our wall a local origin at (0, 0, 0)

ifcopenshell.api.geometry.edit_object_placement(model, product=wall)

# Add a new wall-like body geometry, 5 meters long, 3 meters high, and 200mm thick

representation = ifcopenshell.api.geometry.add_wall_representation(model, context=body, length=5, height=3, thickness=0.2)

# Assign our new body geometry back to our wall

ifcopenshell.api.geometry.assign_representation(model, product=wall, representation=representation)

# Place our wall in the ground floor

ifcopenshell.api.spatial.assign_container(model, relating_structure=storey, product=wall)

# Write out to a file

model.write("/home/dion/model.ifc")

Here is the result:

Create a work schedule constructing a building floor by floor
import datetime
import ifcopenshell.api.sequence
from ifcopenshell.util.element import get_decomposition
from ifcopenshell.util.placement import get_storey_elevation

# Define a convenience function to add a task chained to a predecessor

def add_task(model, name, predecessor, work_schedule): # Add a construction task
task = ifcopenshell.api.sequence.add_task(model,
work_schedule=work_schedule, name=name, predefined_type="CONSTRUCTION")

    # Give it a time
    task_time = ifcopenshell.api.sequence.add_task_time(model, task=task)

    # Arbitrarily set the task's scheduled time duration to be 1 week
    ifcopenshell.api.sequence.edit_task_time(model, task_time=task_time,
        attributes={"ScheduleStart": datetime.date(2000, 1, 1), "ScheduleDuration": "P1W"})

    # If a predecessor exists, create a finish to start relationship
    if predecessor:
        ifcopenshell.api.sequence.assign_sequence(model, relating_process=predecessor, related_process=task)

    return task

# Open an existing IFC4 model you have of a building

model = ifcopenshell.open("/path/to/existing/model.ifc")

# Create a new construction schedule

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction")

# Let's imagine a starting task for site establishment.

task = add_task(model, "Site establishment", None, schedule)
start_task = task

# Get all our storeys sorted by elevation ascending.

storeys = sorted(model.by_type("IfcBuildingStorey"), key=lambda s: get_storey_elevation(s))

# For each storey ...

for storey in storeys:

    # Add a construction task to construct that storey, using our convenience function
    task = add_task(model, f"Construct {storey.Name}", task, schedule)

    # Assign all the products in that storey to the task as construction outputs.
    for product in get_decomposition(storey):
        ifcopenshell.api.sequence.assign_product(model, relating_product=product, related_object=task)

# Ask the computer to calculate all the dates for us from the start task.

# For example, if the first task started on the 1st of January and took a

# week, the next task will start on the 8th of January. This saves us

# manually doing date calculations.

ifcopenshell.api.sequence.cascade_schedule(model, task=start_task)

# Calculate the critical path and floats.

ifcopenshell.api.sequence.recalculate_schedule(model, work_schedule=schedule)

# Write out to a file

model.write("/home/dion/model.ifc")

Geometry is specified in many ways in IFC. Some geometry is defined explicitly with coordinates, vertices, and faces. Some geometry is defined implicitly with equations, boolean operations, and parametric shapes.

Individual processing

The simplest way to process any geometry in a standardised fashion is to use the IfcOpenShell create_shape() function. This will provide a list of vertices, edges, and faces, or alternatively an OpenCASCADE BRep.

Warning

This section describes individual processing only. This is useful for learning how geometry processing works, but is not recommended for practical applications. See the Geometry iterator section below after reading this to see how to process geometry with multiple threads.

Here is a simple example of processing a single wall into a list of vertices and faces. In this example, a shape variable is returned, which holds geometry related information in shape.geometry:

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.shape

ifc_file = ifcopenshell.open('model.ifc')
element = ifc_file.by_type('IfcWall')[0]

settings = ifcopenshell.geom.settings()
shape = ifcopenshell.geom.create_shape(settings, element)

# The GUID of the element we processed

print(shape.guid)

# The ID of the element we processed

print(shape.id)

# The element we are processing

print(ifc_file.by_guid(shape.guid))

# A unique geometry ID, useful to check whether or not two geometries are

# identical for caching and reuse. The naming scheme is:

# IfcShapeRepresentation.id{-layerset-LayerSet.id}{-material-Material.id}{-openings-[Opening n.id ...]}{-world-coords}

print(shape.geometry.id)

# A 4x4 matrix representing the location and rotation of the element, in the form:

# [ [ x_x, y_x, z_x, x ]

# [ x_y, y_y, z_y, y ]

# [ x_z, y_z, z_z, z ]

# [ 0.0, 0.0, 0.0, 1.0 ] ]

# The position is given by the last column: (x, y, z)

# The rotation is described by the first three columns, by explicitly specifying the local X, Y, Z axes.

# The first column is a normalised vector of the local X axis: (x_x, x_y, x_z)

# The second column is a normalised vector of the local Y axis: (y_x, y_y, y_z)

# The third column is a normalised vector of the local Z axis: (z_x, z_y, z_z)

# The axes follow a right-handed coordinate system.

# Objects are never scaled, so the scale factor of the matrix is always 1.

matrix = shape.transformation.matrix

# For convenience, you might want the matrix as a nested numpy array, so you can do matrix math.

matrix = ifcopenshell.util.shape.get_shape_matrix(shape)

# You can also extract the XYZ location of the matrix.

location = matrix[:,3][0:3]

# X Y Z of vertices in flattened list e.g. [v1x, v1y, v1z, v2x, v2y, v2z, ...]

# These vertices are local relative to the shape's transformation matrix.

verts = shape.geometry.verts

# Indices of vertices per edge e.g. [e1v1, e1v2, e2v1, e2v2, ...]

# If the geometry is mesh-like, edges contain the original edges.

# These may be quads or ngons and not necessarily triangles.

edges = shape.geometry.edges

# Indices of vertices per triangle face e.g. [f1v1, f1v2, f1v3, f2v1, f2v2, f2v3, ...]

# Note that faces are always triangles.

faces = shape.geometry.faces

# Since the lists are flattened, you may prefer to group them like so depending on your geometry kernel

# A nested numpy array e.g. [[v1x, v1y, v1z], [v2x, v2y, v2z], ...]

grouped_verts = ifcopenshell.util.shape.get_vertices(shape.geometry)

# A nested numpy array e.g. [[e1v1, e1v2], [e2v1, e2v2], ...]

grouped_edges = ifcopenshell.util.shape.get_edges(shape.geometry)

# A nested numpy array e.g. [[f1v1, f1v2, f1v3], [f2v1, f2v2, f2v3], ...]

grouped_faces = ifcopenshell.util.shape.get_faces(shape.geometry)

# A list of styles that are relevant to this shape

styles = shape.geometry.materials

for style in styles: # Each style is named after the entity class if a default # material is applied. Otherwise, it is named "surface-style-{SurfaceStyle.name}" # All non-alphanumeric characters are replaced with a "-".
print(style.original_name())

    # A more human readable name
    print(style.name)

    # Each style may have diffuse colour RGB codes
    if style.has_diffuse:
        print(style.diffuse)

    # Each style may have transparency data
    if style.has_transparency:
        print(style.transparency)

# Indices of material applied per triangle face e.g. [f1m, f2m, ...]

material_ids = shape.geometry.material_ids

# IDs representation item per triangle face e.g. [f1i, f2i, ...]

item_ids = shape.geometry.item_ids

Alternatively, you may choose to retrieve an OpenCASCADE BRep:

import ifcopenshell
import ifcopenshell.geom

ifc_file = ifcopenshell.open('model.ifc')
element = ifc_file.by_type('IfcWall')[0]

settings = ifcopenshell.geom.settings()
settings.set(settings.USE_PYTHON_OPENCASCADE, True)

try:
shape = geom.create_shape(settings, element)
geometry = shape.geometry # see #1124 # These are methods of the TopoDS_Shape class from pythonOCC
shape_gpXYZ = geometry.Location().Transformation().TranslationPart() # These are methods of the gpXYZ class from pythonOCC
print(shape_gpXYZ.X(), shape_gpXYZ.Y(), shape_gpXYZ.Z())
except:
print("Shape creation failed")

When an entire element is passed into create_shape(), the 3D representation is processed by default with all openings applied. However, it is also possible to only process a single shape representation with no openings, representation item, or profile definition.

In these scenarios, a geometry is returned directly, equivalent to shape.geometry in the example above.

ifc_file = ifcopenshell.open('model.ifc')
element = ifc_file.by_type('IfcWall')[0]

# Process a shape representation

body = ifcopenshell.util.representation.get_representation(element, "Model", "Body")

# Note: geometry is returned directly, equivalent to shape.geometry when passing in an element

geometry = geom.create_shape(settings, body)

# Process a representation item

geometry = geom.create_shape(settings, ifc_file.by_type("IfcExtrudedAreaSolid")[0])

# Process a profile

geometry = geom.create_shape(settings, ifc_file.by_type("IfcProfileDef")[0])

When an element contains multiple shape representations with the same identifier or when you want more explicit control over which representation is processed (e.g Body or Tessellation), you can use the third parameter of create_shape() to nominate a specific shape representation to be processed in the context of a product. The element in your ifc file might look like this.

#1=IFCSHAPEREPRESENTATION(#4,'Body','BRep',(#1617476));
#2=IFCSHAPEREPRESENTATION(#4,'Body','BRep',(#1617583));
#3=IFCSHAPEREPRESENTATION(#4,'Body','BRep',(#1617630));
#5=IFCPRODUCTDEFINITIONSHAPE($,$,(#1,#2,#3));
#6=IFCWINDOW('0Rrp2csNr07QrVCrEBJezu',#9,'test','test',$,#7,#5,'test',$,$,$,$,$);

In order to get the geometry data (e.g. vertices) for this IfcWindow, we can use the Python code below:

representations = window.Representation.Representations
for representation in representations: # ... code that filters which representation you want ...
shape = ifcopenshell.geom.create_shape(settings, window, representation)

See also

You may find the ifcopenshell.util.representation module useful to filter out specific representations.

Geometry iterator

IfcOpenShell provides a geometry iterator function to efficiently process geometry in an IFC model. The iterator is always used in IfcConvert, and may also be invoked in C++ or in Python. It offers the same features as the create_shape() function for Individual processing.

The geometry iterator makes it easy to collect possible geometry in a model, supports multicore processing, and implements caching and reuse to improve the efficiency of geometry processing. For any bulk geometry processing, it is always recommended to use the iterator.

By default, the geometry iterator processes all 3D geometry in a model from all elements, and returns a list of X Y Z vertex ordinates in a flattened list, as well as a flattened list of triangulated faces denoted by vertex indices.

Here is a simple example in Python:

import multiprocessing
import ifcopenshell
import ifcopenshell.geom

ifc_file = ifcopenshell.open('model.ifc')

settings = ifcopenshell.geom.settings()
iterator = ifcopenshell.geom.iterator(settings, ifc_file, multiprocessing.cpu_count())
if iterator.initialize():
while True:
shape = iterator.get()
element = ifc_file.by_id(shape.id)
matrix = shape.transformation.matrix
faces = shape.geometry.faces
edges = shape.geometry.edges
verts = shape.geometry.verts
materials = shape.geometry.materials
material_ids = shape.geometry.material_ids # ... write code to process geometry here ...
if not iterator.next():
break

There are a variety of configuration settings to get different output. For example, you may filter elements from processing, extract 2D data, or return non-triangulated OpenCASCADE BReps. For more information on the various settings, see Geometry Settings.

One of the more common settings used is the include setting, which specifies only to process certain geometry. For example, this iterator will only process wall elements.

walls = ifc.by_type('IfcWall')
iterator = ifcopenshell.geom.iterator(settings, ifc, multiprocessing.cpu_count(), include=walls)

Note

The iterator can only be used to process whole elements, not individual shape representations, representation items, and profiles.

Manual parsing

IfcOpenShell lets you traverse any IFC entity graph. This means it is possible for you to manually browse through the Representation attribute of IFC elements, and parse the corresponding IFC shape representations yourself instead of using generic geometric processing such as Individual processing and the Geometry iterator.

This approach requires an in-depth understanding of IFC geometry representations, as well as its many caveats with units and transformations, but can be very simple and extremely fast to extract specific types of geometry. For example, if you know you are dealing with IfcCircle geometry, you can specifically pinpoint the Radius parameter.

unit_scale = ifcopenshell.util.unit.calculate_unit_scale(ifc_file)

for circle in ifc_file.by_type("IfcCircle"): # In project length units
print(circle.Radius)

    # In SI meters
    print(circle.Radius * unit_scale)

Given the advanced nature of manual processing, it is generally not recommended except in specific tasks.

Geometry serialisation

Geometry may be serialised into many different formats using IfcConvert. Alternatively, you may also access the serialiser with Python to customise the conversion, such as by writing a script that modifies the IFC on the fly before converting it, or writing complex include and exclude filters.

Here is a typical example to serialising to glTF / glb. Example settings to serialise to other formats are shown commented out. Different serialisations may require different settings.

import ifcopenshell
import ifcopenshell.geom
import multiprocessing

settings = ifcopenshell.geom.settings()

# Settings for glTF / glb

settings.set(settings.STRICT_TOLERANCE, True)
settings.set(settings.INCLUDE_CURVES, True)

# Setting element GUIDs is optional, but useful to uniquely identify objects in non-semantic formats.

settings.set(settings.USE_ELEMENT_GUIDS, True)

# Note that applying default materials is required in glTF serialisation.

settings.set(settings.APPLY_DEFAULT_MATERIALS, True)

# Settings for obj

# settings.set(settings.STRICT_TOLERANCE, True)

# settings.set(settings.INCLUDE_CURVES, True)

# settings.set(settings.USE_ELEMENT_GUIDS, True)

# settings.set(settings.APPLY_DEFAULT_MATERIALS, True)

# settings.set(settings.USE_WORLD_COORDS, True)

# Serialise to glTF / glb

serialiser = ifcopenshell.geom.serializers.gltf("output.glb", settings)

# Serialise to obj

# serialiser = ifcopenshell.geom.serializers.obj('output.obj', 'output.mtl', settings)

serialiser.setFile(self.file)
serialiser.setUnitNameAndMagnitude("METER", 1.0)
serialiser.writeHeader()

iterator = ifcopenshell.geom.iterator(settings, self.file, multiprocessing.cpu_count())
if iterator.initialize():
while True:
serialiser.write(iterator.get())
if not iterator.next():
break
serialiser.finalize()

# Geometry creation

Walls, doors, slabs, and other physical products in IFC can be represented with 2D or 3D geometry. Most commonly, this geometry is created using graphical frontends, like the BlenderBIM Add-on. IfcOpenShell can create and edit geometry with code.

Note

Geometry is optional in IFC. For many usecases, geometry is not required, such as in facility management.

General concepts

Any IFC element may have a location in the 3D world known as the Object Placement. The Object Placement is the “local origin” of the object. This is sometimes known as the object’s center or insertion point in other software. The Object Placement is typically somewhere at a corner, center, or midpoint of the object. The Object Placement may be used to identify a rough “coordinate” location of the object’s start / center, and used as a center of transformation when moving or rotating the object’s geometry. The object’s geometry is always relative to the Object Placement.

Note

Object Placements are optional if the object has no geometry. However, any object with a geometry must have an Object Placement.

IFC products may have multiple geometric representations, positioned relative to the Object Placement. For example, a door might have a 3D body of a “closed door” as one geometric representation, a 2D linework of an “open door” intended to be shown in a plan, a 3D box showing the clearance of the door for disabled access, and 3D dashed linework showing the hinge and swing of a door in an elevation or section. Of course, you might not want to see all this geometry at the same time. What you see depends on the context you are viewing the door in.

For this reason, each one of these geometric representations is called a Representation. Each Representation belongs to a Representation Context. The Representation Context determines how the Representation is intended to be viewed. For example, a “2D Plan View” might be a Representation Context. This allows the user to choose to see the appropriate Representation.

A Representation contains one or more Representation Items. Each Representation Item could be an extrusion, a mesh, a surface, a curve, and so on depending on the type of geometric modeling technique. Techniques cannot be mixed, so a single Representation may be made out of multiple extrusion Items but cannot have both extrusions and meshes.

Objects may also have the concept of Types and Material Sets that inform their shape. For example, if a light fixture Type has a Representation, all occurrences of that light fixture must have the exact same Representation. This is called a Mapped Representation. Similarly, if a wall Type has a Material Set defining layers and their thicknesses, all wall occurrences of that wall Type must have the same thickness (although the length of the wall may vary). Alternatively, if a column Type has a Material Set defining a cross sectional profile, then all occurrences of that column type must have the same cross section (although the height of the column may vary).

See also

The vast majority of objects in the built environment use Types and Material Sets, such as slabs, walls, columns, beams, doors, windows, and furniture. For this reason, it is highly recommended to not just create Representations for individual objects, but first consider creating a Type. After you get a general understanding of Representations, please read the section on Types and mapped representations, Material layer sets, and Material profile sets.

Project units

All coordinates in IFC are stored using project units. This means that prior to creating Object Placements or Representations you have to define a project length unit as a minimum.

Assuming you are creating a project from scratch with code, here is how you might define units:

import ifcopenshell.api.root
import ifcopenshell.api.unit

# You need a project before you can assign units.

ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")

# Let's say we want coordinates to be in millimeters.

length = ifcopenshell.api.unit.add_si_unit(model, unit_type="LENGTHUNIT", prefix="MILLI")
ifcopenshell.api.unit.assign_unit(model, units=[length])

# Alternatively, you may specify without any arguments to automatically

# create millimeters, square meters, and cubic meters as a convenience for

# testing purposes. Sorry imperial folks, we prioritise metric here.

ifcopenshell.api.unit.assign_unit(model)

Object placements

The Object Placement describes Location and Rotation. The Location is given as an XYZ coordinate, and the Rotation is given as two vectors: a local X axis and a local Z axis vector. The local Y axis vector is derived via a right-handed coordinate system. This means that the global X axis points to “Project East”, the global Y axis points to “Project North”, and the global Z axis points up (i.e. to the sky). This coordinate system is the same system used in Blender.

The recommended way to set an Object Placement is to specify the placement as a 4x4 matrix. You can use the numpy library to create and edit matrices. A 4x4 matrix looks like this:

1, 0, 0, 0
0, 1, 0, 0
0, 0, 1, 0
0, 0, 0, 1

This type of matrix is known as the Identity Matrix. It represents no translation (i.e. a location at the origin of 0, 0, 0) and no rotation (i.e. the X axis is 1, 0, 0, the Y axis is 0, 1, 0, and the Z axis is 0, 0, 1). The numbers in the matrix correlate to the location and rotation axes as follows:

XAxis_X, YAxis_X, ZAxis_X, X
XAxis_Y, YAxis_Y, ZAxis_Y, Y
XAxis_Z, YAxis_Z, ZAxis_Z, Z
0, 0, 0, 1

Notice how the last line is always fixed to 0, 0, 0, 1. For example, here is another matrix of an object at 2, 3, 5 that is rotated anti-clockwise by 90 degrees.

0, -1, 0, 2
1, 0, 0, 3
0, 0, 1, 5
0, 0, 0, 1

Here’s how we might do the same operation with Python code:

import numpy
import ifcopenshell.api.root
import ifcopenshell.api.geometry

# Create a wall. Our wall currently has no object placement or representations.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Create a 4x4 identity matrix. This matrix is at the origin with no rotation.

matrix = numpy.eye(4)

# Rotate the matix 90 degrees anti-clockwise around the Z axis (i.e. in plan).

# Anti-clockwise is positive. Clockwise is negative.

matrix = ifcopenshell.util.placement.rotation(90, "Z") @ matrix

# Set the X, Y, Z coordinates. Notice how we rotate first then translate.

# This is because the rotation origin is always at 0, 0, 0.

matrix[:,3][0:3] = (2, 3, 5)

# Set our wall's Object Placement using our matrix.

# `is_si=True` states that we are using SI units instead of project units.

ifcopenshell.api.geometry.edit_object_placement(model, product=wall, matrix=matrix, is_si=True)

Representation contexts

As an object may have multiple Representations, we need to use Representation Contexts to distinguish the purpose and intended context of each Representation.

A Representation Context is defined in terms of X paramters:

Context Type: 3D Model or 2D Plan

Context Identifier: The purpose of the Representation

Target View: The drafting convention of the Representation

Target Scale: The scale for the representation to be shown at

The Context Type must either be set to Model for 3D Representations or Plan for 2D Representations.

The most common Context Identifiers you might use are:

Body: for the actual physical shape of the object

Box: the bounding box of the object (useful for shape analytics)

Axis: the parametric line determining the shape of the object

Profile: the elevation silhouette of the object, useful for cutting out holes for the object to fit into host elements

Footprint: the plan view silhouette of the object, useful for certain quantity take-off rules

Clearance: the clearance zone of the object

Annotation: symbolic annotations typically used in diagrams or drawings

The most common Target Views you might use are:

MODEL_VIEW: for general 3D geometry you might see in a BIM viewer or any generic fallback representation

PLAN_VIEW: for 2D geometry you might see in a plan representation

ELEVATION_VIEW: for 2D geometry you might see in an elevation representation

SECTION_VIEW: for 2D geometry you might see in a section representation

GRAPH_VIEW: for 2D or 3D line or frame or path connectivity diagrams you might use for structural frame analysis, axis-based parametric modeling

SKETCH_VIEW: for viewing abstract high-level representations such as in bubble diagrams of spatial topology

The vast majority of the time, you will only be interested in using a 3D Body MODEL_VIEW Representation Context.

import ifcopenshell.api.context

# If we plan to store 3D geometry in our IFC model, we have to setup

# a "Model" context.

model3d = ifcopenshell.api.context.add_context(model, context_type="Model")

# And/Or, if we plan to store 2D geometry, we need a "Plan" context

plan = ifcopenshell.api.context.add_context(model, context_type="Plan")

# Now we setup the subcontexts with each of the geometric "purposes"

# we plan to store in our model. "Body" is by far the most important

# and common context, as most IFC models are assumed to be viewable

# in 3D.

body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

# The 3D Axis subcontext is important if any "axis-based" parametric

# geometry is going to be created. For example, a beam, or column

# may be drawn using a single 3D axis line, and for this we need an

# Axis subcontext.

ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Axis", target_view="GRAPH_VIEW", parent=model3d)

# It's also important to have a 2D Axis subcontext for things like

# walls and claddings which can be drawn using a 2D axis line.

ifcopenshell.api.context.add_context(model,
context_type="Plan", context_identifier="Axis", target_view="GRAPH_VIEW", parent=plan)

# The 3D Box subcontext is useful for clash detection or shape

# analysis, or even lazy-loading of large models.

ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Box", target_view="MODEL_VIEW", parent=model3d)

# A 2D annotation subcontext for plan views are important for door

# swings, window cuts, and symbols for equipment like GPOs, fire

# extinguishers, and so on.

ifcopenshell.api.context.add_context(model,
context_type="Plan", context_identifier="Annotation", target_view="PLAN_VIEW", parent=plan)

# You may also create 2D annotation subcontexts for sections and

# elevation views.

ifcopenshell.api.context.add_context(model,
context_type="Plan", context_identifier="Annotation", target_view="SECTION_VIEW", parent=plan)
ifcopenshell.api.context.add_context(model,
context_type="Plan", context_identifier="Annotation", target_view="ELEVATION_VIEW", parent=plan)

Representations

Once you have an Object Placement and a Representation Context, you can now create a Representation.

Each Representations must choose a geometry modeling technique. For example, you may specify a mesh-like geometry, which uses vertices, edges, and faces. Alternatively, you may specify 2D profiles extruded into solid shapes and potentially having boolean voids and subtractions. You may even specify single edges and linework without any surfaces or solids. Representations may even be single points, such as for survey points or structual point connections.

After the Representation is created, you will need to assign the Representation to the IFC object (e.g. wall, door, slab, etc). Here’s the general pattern in code:

import ifcopenshell.api.root
import ifcopenshell.api.unit
import ifcopenshell.api.context
import ifcopenshell.api.project
import ifcopenshell.api.geometry

# Let's create a new project using millimeters with a single furniture element at the origin.

model = ifcopenshell.api.project.create_file
ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")
ifcopenshell.api.unit.assign_unit(model)

# We want our representation to be the 3D body of the element.

# This representation context is only created once per project.

# You must reuse the same body context every time you create a new representation.

model3d = ifcopenshell.api.context.add_context(model, context_type="Model")
body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

# Create our element with an object placement.

element = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")
ifcopenshell.api.geometry.edit_object_placement(model, product=element)

# Let's create our representation!

# See below sections for examples on how to create representations.

representation = ...

# Assign our new body representation back to our element

ifcopenshell.api.geometry.assign_representation(model, product=element, representation=representation)

Mesh representations

Mesh Representations are specified in terms of a list of vertices, edges, and faces. The faces may be triangles, quads, or n-gons. Faces may also contain inner loops, or holes. Mesh Representations are most appropriately used for complex shapes that only need to approximately represent physical products, such as furniture or equipment, or flat, panellised design (e.g. triangulated facade elements). Mesh Representations are also suitable for box-like shapes that have bespoke indents, protrusions, TINs, textured, or as-built geometry.

In IFC, meshes may be stored as Faceted BReps, Tessellations, or Triangulations (specifically only for triangles).

# These vertices and faces represent a 2m square 1m high pyramid in SI units.

# Note how they are nested lists. Each nested list represents a "mesh". There may be multiple meshes.

vertices = [[(0.,0.,0.), (0.,2.,0.), (2.,2.,0.), (2.,0.,0.), (1.,1.,1.)]]
faces = [[(0,1,2,3), (0,4,1), (1,4,2), (2,4,3), (3,4,0)]]
representation = ifcopenshell.api.geometry.add_mesh_representation(model, context=body, vertices=vertices, faces=faces)

Wall representations

Wall-like Representations are simple blocks with a length, height, and thickness. They are most appropriately used for walls, insulation, bulkhead ends, cladding, and other uniformly thick blocks that extend along an imaginary 2D line in the XY plane.

Note

Even though the function is named add_wall_representation, you may use this geometry for any element, not just walls.

# A wall-like representation, 5 meters long, 3 meters high, and 200mm thick

representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=5, height=3, thickness=0.2)

A wall-like Representation always starts at the Object Placement and runs along the local +X axis. The thickness is always along the local Y axis. This means that if you want the wall-like object to start and end at a particular point, you have to set the Object Placement location and rotation as appropriate. This can be done using the API:

# A wall-like representation starting and ending at a particular 2D point

representation = ifcopenshell.api.geometry.create_2pt_wall(model,
element=element, context=body, p1=(1., 1.), p2=(3., 2.), elevation=0, height=3, thickness=0.2)

Profile representations

Profile-based Representations are defined by a 2D profile in the XY plane which is then extruded in the +Z direction. They are most appropriately used for slabs, columns, beams, and other structural members.

The 2D profile may be defined as an arbitrary curve, or as a parameterised shape (e.g. a circle defined by a center and a radius). Arbitrary curves are typically used for objects like slabs, cornices, or country-specific cold-rolled steel, whereas parameterised shapes (circles, rectangles, I-shapes, C-shapes, Z-shapes) are typically used for objects like columns and beams and hot-rolled steel.

Where possible, it is recommended to use parameterised profiles that are named after the structural cross section naming standard (e.g. structural steel standard names) in your country.

# Rectangles (or squares) are typically used for concrete columns and beams

profile = model.create_entity("IfcRectangleProfileDef", ProfileName="600x300", ProfileType="AREA",
XDim=600, YDim=300)

# Rectangle profiles may be rounded

profile = model.create_entity("IfcRoundedRectangleProfileDef", ProfileName="600x300r100", ProfileType="AREA",
XDim=600, YDim=300, RoundingRadius=100)

# Rectangle profiles may be hollow and optionally rounded as well. The radius parameters are optional.

# These are typically used for rectangular or square hollow steel sections.

profile = model.create_entity("IfcRectangleHollowProfileDef", ProfileName="200x100RHS", ProfileType="AREA",
XDim=200, YDim=100, WallThickness=5, InnerFilletRadius=5, OuterFilletRadius=10)

# Circles are typically used for concrete columns

profile = model.create_entity("IfcCircleProfileDef", ProfileName="300C", ProfileType="AREA",
Radius=300)

# Hollow circular profiles are typically used for steel members

profile = model.create_entity("IfcCircleHollowProfileDef", ProfileName="300CHS", ProfileType="AREA",
Radius=150, WallThickness=5)

# Ellipses aren't common but may be used.

profile = model.create_entity("IfcEllipseProfileDef", ProfileName="300E", ProfileType="AREA",
SemiAxis1=300, SemiAxis2=200)

# I-shapes are typically used in hot-rolled or welded steel. FilletRadius onwards is optional.

profile = model.create_entity("IfcIShapeProfileDef", ProfileName="I-EXAMPLE", ProfileType="AREA",
OverallWidth=100, OverallDepth=200, WebThickness=10, FlangeThickness=15, FilletRadius=10)

# L-shapes are typically used in hot rolled steel. FilletRadius onwards is optional.

profile = model.create_entity("IfcLShapeProfileDef", ProfileName="L-EXAMPLE", ProfileType="AREA",
Depth=75, Width=75, Thickness=10, FilletRadius=10, EdgeRadius=5, LegSlope=0)

# T-shapes are typically used in hot rolled steel. FilletRadius onwards is optional.

profile = model.create_entity("IfcTShapeProfileDef", ProfileName="T-EXAMPLE", ProfileType="AREA",
Depth=150, FlangeWidth=100, WebThickness=10, FlangeThickness=15, FilletRadius=10,
FlangeEdgeRadius=5, WebEdgeRadius=5, WebSlope=0, FlangeSlope=0)

# U-shapes are typically used in hot rolled steel. FilletRadius onwards is optional.

profile = model.create_entity("IfcUShapeProfileDef", ProfileName="U-EXAMPLE", ProfileType="AREA",
Depth=200, FlangeWidth=100, WebThickness=5, FlangeThickness=10,
FilletRadius=5, EdgeRadius=5, FlangeSlope=0)

# Z-shapes are typically used in hot rolled steel. FilletRadius onwards is optional.

profile = model.create_entity("IfcZShapeProfileDef", ProfileName="Z-EXAMPLE", ProfileType="AREA",
Depth=100, FlangeWidth=50, WebThickness=5, FlangeThickness=10, FilletRadius=5, EdgeRadius=5)

# C-shapes are typically used in cold rolled steel

profile = model.create_entity("IfcCShapeProfileDef", ProfileName="C-EXAMPLE", ProfileType="AREA",
Depth=150, Width=75, WallThickness=1.5, Girth=30, InternalFilletRadius=5)

Alternatively, you may specify a custom arbitrary profile. Arbitrary profile curves are most easily defined using a polyline. The polyline may have straight segments and arc segments. Arcs are defined as 3-point arcs (start, mid, and end). The arc points define the starting index (counting from 1) of any optional arcs. Profiles may also have inner curves to represent voids.

builder = ifcopenshell.util.shape_builder.ShapeBuilder(model)
outer_curve = builder.polyline([(0.,0.), (100.,0.), (100.,50.), (51.2,98.7), (18.5,105.3), (0.,77.5)],
arc_points=[4], closed=True)
inner_curve = builder.circle((50.,50.), radius=10.)
profile = builder.profile(outer_curve, inner_curves=[inner_curve], name="Arbitrary")

Once you have created your profile, you can add a representation which uses that profile as its cross section. Profiles are always extruded in the +Z direction. So if you want to have a beam, you will need to rotate the Object Placement to place the element on its side.

# A profile-based representation, 1 meter long

representation = ifcopenshell.api.geometry.add_profile_representation(model, context=body, profile=profile, depth=1)

Custom representations

You may also create your own solid by creating multiple custom profiles, extruding them into solids, then combining the solids into your own shapes. For example, a table may be formed by 5 rectangular extrusions: one for the table top, and 4 table legs. This can be done using the shape builder utility module.

The standard approach is:

Define at least one 2D outer curve and optional inner curves (for holes).

Optionally convert your outer and optional inner curves into a profile. This is only necessary if you want to give your profile a name (so that you may reuse it and manage it in a profile library) or if you have inner curves.

Optionally extrude your profile into a solid. If you are creating 2D representations, then extrusion is not necessary.

Optionally move your extruded solid into your desired location through translation, rotation, or mirroring.

Convert all your extruded solids (or just curves, if 2D) into a Representation with a Representation Context.

Here is an example which generates a parametric table.

# The shape_builder module depends on mathutils

from ifcopenshell.util.shape_builder import V

builder = ifcopenshell.util.shape_builder.ShapeBuilder(model)

# Parameters to define our table

width = 1200
depth = 700
height = 750
leg_size = 50.0
thickness = 50.0

# Extrude a rectangle profile for the tabletop

rectangle = builder.rectangle(size=V(width, depth))
tabletop = builder.extrude(builder.profile(rectangle), thickness, V(0, 0, height - thickness))

# Create a table leg curve, mirror it along two axes, and extrude.

leg_curve = builder.rectangle(size=V(leg_size, leg_size))
legs_curves = [leg_curve] + builder.mirror(
leg_curve,
mirror_axes=[V(1, 0), V(0, 1), V(1, 1)],
mirror_point=V(width / 2, depth / 2),
create_copy=True,
)
legs_profiles = [builder.profile(leg) for leg in legs_curves]
legs = [builder.extrude(leg, height - thickness) for leg in legs_profiles]

# Shift our table such that the object origin is in the center.

items = [tabletop] + legs
shift_to_center = V(-width / 2, -depth / 2)
builder.translate(items, shift_to_center.to_3d())

# Create a body representation

body = ifcopenshell.util.representation.get_context(model, "Model", "Body", "MODEL_VIEW")
representation = builder.get_representation(context=body, items=items)

Another really common case for using the shape builder is when creating Representations of reinforcement bars, cables, or circular railings. IFC has a special type of extrusion specifically for extruding a disk (i.e. circle) along a path. This should almost always be used for usecases like reinforcement bar.

builder = ifcopenshell.util.shape_builder.ShapeBuilder(model)

# Sweep a 10mm radius disk along a polyline with a couple of straight segments and an arc.

curve = builder.polyline(
[(0., 0., 0.), (100., 0., 0.), (171., 29., 0.), (200., 100., 0.), (200., 200., 0.)],
arc_points=[2])
swept_curve = builder.create_swept_disk_solid(curve, 10)

# Create a body representation

body = ifcopenshell.util.representation.get_context(model, "Model", "Body", "MODEL_VIEW")
representation = builder.get_representation(body, swept_curve)

For more information, consult the shape builder documentation.

OpenCASCADE representations

If you are familiar with OpenCASCADE’s Python bindings, you may also use OpenCASCADE directly to create geometry. Since both OpenCASCADE and IFC are inspired by STEP, the majority of OpenCASCADE shapes will be able to be converted into IFC. For example:

import ifcopenshell
import ifcopenshell.geom
from OCC.Core.gp import gp_Pnt
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Cut

outer = BRepPrimAPI_MakeBox(gp_Pnt(-5000., -180., -2000.), gp_Pnt(5000., 5180., 3000.)).Shape()
inner = BRepPrimAPI_MakeBox(gp_Pnt(-4640., 180., 0.), gp_Pnt(4640., 4820., 3000.)).Shape()
window1 = BRepPrimAPI_MakeBox(gp_Pnt(-5000., -180., 400.), gp_Pnt( 500., 1180., 2000.)).Shape()
window2 = BRepPrimAPI_MakeBox(gp_Pnt( 2070., -180., 400.), gp_Pnt(3930., 180., 2000.)).Shape()
building_shell = BRepAlgoAPI_Cut(
BRepAlgoAPI_Cut(
BRepAlgoAPI_Cut(outer, inner).Shape(),
window1
).Shape(),
window2
).Shape()

model = ifcopenshell.file(schema="IFC2X3")
product_definition = ifcopenshell.geom.serialise("IFC2X3", building_shell, False)
product_definition = model.add(product_definition)

Warning

The schema version is significant. IFC2X3 is very limited with regard to curved surfaces, so generally non-planar surfaces will fail to serialise in IFC2X3. Newer versions such as IFC4 can support more serialisations. If a serialisation fails, ifcopenshell.geom.serialise will return None.

Manual representations

Although IfcOpenShell provides many convenience functions and utility modules, you may wish to disregard this and manually create each IFC class yourself. This is generally not recommended but is useful as an educational exercise or if you want to create a particularly bespoke shape that IfcOpenShell does not have a convenience function for yet. You will be required to have a detailed understanding of IFC geometry which is explained in the IFC documentation.

Here is an example of manually creating a simple extruded rectangle.

rectangle = model.createIfcRectangleProfileDef(ProfileType="AREA", XDim=500, YDim=250)
direction = model.createIfcDirection((0., 0., 1.))
extrusion = model.createIfcExtrudedAreaSolid(SweptArea=rectangle, ExtrudedDirection=direction, Depth=1000)
body = ifcopenshell.util.representation.get_context(model, "Model", "Body", "MODEL_VIEW")
representation = model.createIfcShapeRepresentation(
ContextOfItems=body, RepresentationIdentifier="Body", RepresentationType="SweptSolid", Items=[extrusion])

Types and mapped representations

Very often, the Representation of a type is exactly the same for all of its occurrences. For example, all furniture, equipment (pumps, valves, dampers, etc) occurrences will be exactly the same.

In this scenario, the Representation should be assigned to the type. Each of the occurrences will then use a Mapped Representation. This is both efficient and implies that the type is interchangable (e.g. for maintenance).

# Create our element type. Types do not have an object placement.

element_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurnitureType")

# Let's create our representation!

# See above sections for examples on how to create representations.

representation = ...

# Assign our representation to the element type.

ifcopenshell.api.geometry.assign_representation(model, product=element_type, representation=representation)

# Create our element occurrence with an object placement.

element = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")
ifcopenshell.api.geometry.edit_object_placement(model, product=element)

# Assign our furniture occurrence to the type.

# That's it! The representation will automatically be mapped!

ifcopenshell.api.type.assign_type(model, related_objects=[element], relating_type=element_type)

Material layer sets

If a type has a material layer set, it implies that all occurrences of that type must use the same material layer set. For example, if a wall type has multiple material layers adding up to a thickness of 100mm, then all walls of that wall type must be exactly 100mm thick. The height, length, angle or curvature of the wall may vary, but the thickness may not.

Because only the thickness is fixed, you are still responsible for creating the representation of walls yourself. IfcOpenShell will not check whether or not your representation complies with the thickness constraint, so it is your responsibility to make sure the geometry is correct.

# Let's imagine a wall type called WAL01 using a material layer set.

wall_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWallType", name="WAL01")

# First, let's create a material set. This will later be assigned to our wall type element.

material_set = ifcopenshell.api.material.add_material_set(model,
name="GYP-ST-GYP", set_type="IfcMaterialLayerSet")

# Let's create a few materials.

gypsum = ifcopenshell.api.material.add_material(model, name="PB01", category="gypsum")
steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Create 3 layers for a steel studded plasterboard wall.

layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 13})
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=steel)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 92})
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 13})

# Great! Let's assign our material set to our wall type.

ifcopenshell.api.material.assign_material(model, products=[wall_type], material=material_set)

# Now, let's create a wall at the origin.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
ifcopenshell.api.geometry.edit_object_placement(model, product=wall)

# The wall is a WAL01 wall type. The material layer set is inherited.

ifcopenshell.api.type.assign_type(model, related_objects=[wall], relating_type=wall_type)

# It's now our responsibility to create a compatible representation.

# Notice how our thickness of 0.118 must equal .013 + .092 + .013 from our type

body = ifcopenshell.util.representation.get_context(model, "Model", "Body", "MODEL_VIEW")
representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=5, height=3, thickness=0.118)

# Assign our new body geometry back to our wall

ifcopenshell.api.geometry.assign_representation(model, product=wall, representation=representation)

Material profile sets

If a type has a material profile set, it implies that all occurrences of that type must use the same material profile set. For example, if a beam type has a material profile of an “I-shape”, then all beams of that beam type must use that exact same I-shape profile. The length, angle or curvature of the beam may vary, but the cross sectional profile may not.

Because only the profile is fixed, you are still responsible for creating the representation of walls yourself. IfcOpenShell will not check whether or not your representation complies with the profile constraint, so it is your responsibility to make sure the geometry is correct.

# Let's imagine we have a steel I-beam type called B1.

beam_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBeamType", name="B1")

# First, let's create a material set. This will later be assigned to our beam type element.

material_set = ifcopenshell.api.material.add_material_set(model,
name="B1", set_type="IfcMaterialProfileSet")

# Create a steel material.

steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Create an I-beam profile curve. Notice how we use standardised steel profile names.

hea100 = model.create_entity(
"IfcIShapeProfileDef", ProfileName="HEA100", ProfileType="AREA",
OverallWidth=100, OverallDepth=96, WebThickness=5, FlangeThickness=8, FilletRadius=12,
)

# Define that steel material and cross section as a single profile item. If

# this were a composite beam, we might add multiple profile items instead,

# but this is rarely the case in most construction.

ifcopenshell.api.material.add_profile(model, profile_set=material_set, material=steel, profile=hea100)

# Great! Let's assign our material set to our beam type.

ifcopenshell.api.material.assign_material(model, products=[beam_type], material=material_set)

# Now, let's create a beam at the origin.

beam = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBeam")
ifcopenshell.api.geometry.edit_object_placement(model, product=beam)

# The beam is a B1 beam type. The material profile set is inherited.

ifcopenshell.api.type.assign_type(model, related_objects=[beam], relating_type=beam_type)

# It's now our responsibility to create a compatible representation.

# Notice how we reuse our profile instead of creating a new profile.

body = ifcopenshell.util.representation.get_context(model, "Model", "Body", "MODEL_VIEW")
representation = geometry.add_profile_representation(model, context=body, profile=hea100, depth=1)

# Assign our new body geometry back to our beam

ifcopenshell.api.geometry.assign_representation(model, product=beam, representation=representation)

Geometry tree

IfcOpenShell includes a utility to build trees of geometry and their bounding boxes. Geometry trees can be used to efficiently select geometry or collide geometry with one another.

The most efficient way to build a tree is by using the iterator. If the native OpenCASCADE shape is added to the tree, a UB Tree is built. Alternatively, if triangulation is added to the tree, a BVH Tree is built. The type of tree determines the type of operation you can perform.

import multiprocessing
import ifcopenshell
import ifcopenshell.geom

tree = ifcopenshell.geom.tree()
settings = ifcopenshell.geom.settings()
iterator = ifcopenshell.geom.iterator(settings, ifc_file, multiprocessing.cpu_count())
if iterator.initialize():
while True: # Use triangulation to build a BVH tree
tree.add_element(iterator.get())

        # Alternatively, use this code to build an unbalanced binary tree
        # tree.add_element(iterator.get_native())

        if not iterator.next():
            break

Clashing or selecting geometry from a geometry tree

With a BVH Tree, you can efficiently clash sets of elements with other elements. You can find elements that intersect, collide, or are within a clearance distance threshold of one another. There are three methods you can use to clash elements in the tree. Each function collides one set of elements with another set of elements.

Detecting intersection clashes between elements detects when an element intersects with another element. This is the most common type of clash detection used when coordinating designs. For example, you might want to know if any pipes go through structural columns or beams.

Detecting collision clashes between elements detects when an element touches another element. It is the fastest type of clash detection but does not consider the distance that an element goes inside another element. This considers surfaces only so it works on non-manifold geometry but will not detect if an element is completely within another element.

Detecting clearance clashes between elements detects when an element comes near to another element within a clearance threshold. This is the slowest type of clash detection. It works on non-manifold geometry and does not consider inside vs outside. Elements like pipe and ducts with insulation, structural openings, and equipment will typically require clearance checks.

With a UB Tree, you can efficiently select geometry by specifying a point, radius, or bounding box. There are three methods you can use to select elements in the tree.

Selecting elements using bounding boxes lets you query for elements that contain a point or another element. However, it only checks the bounding box of elements instead of their exact geometry. This is the fastest approach and is recommended if you don’t need precise geometry selection.

Selecting elements using precise geometry lets you query for elements that contain a point, a sphere, or another element. This is similar to selecting using bounding boxes, but additionally considers the actual geometry of the element. This is slower but more precise.

Selecting elements using a ray lets you query for elements that intersect with a ray.

Detecting intersection clashes between elements

clash_intersection_many detects when an element intersects with or is contained within another element.

clashes = tree.clash_intersection_many(
group_a_elements, # e.g. from model.by_type("IfcWall")
group_b_elements, # Group b can be the same as group a if you want to clash within a single set
tolerance=0.002, # Any protrusions less than 2mm are ignored
check_all=True, # Keep on checking all potential intersections to find a worst case protrusion distance
)

for clash in clashes: # Get the two elements that clash and their metadata
element1 = clash.a
element2 = clash.b
a_global_id = element1.get_argument(0)
b_global_id = element2.get_argument(0)
a_ifc_class = element1.is_a()
b_ifc_class = element2.is_a()
a_name = element1.get_argument(2)
b_name = element2.get_argument(2)

    # Potential clash types that can be detected are protrusions, pierces, and collisions
    clash_type = ["protrusion", "pierce", "collision", "clearance"][clash.clash_type],

    # P1 and P2 represents two XYZ coordinates. The meaning of the coordinate depends on the clash type.
    p1 = list(clash.p1)
    p2 = list(clash.p2)

    # This represents the protrusion or piercing distance in meters.
    # It is also the distance between P1 and P2.
    distance = clash.distance

If you specify a tolerance value, intersections with a protrusion distance smaller than this tolerance are excluded. It is recommended to specify a non-zero tolerance to distinguish between when elements merely touch (e.g. a GPO on a wall) versus if they are truly intersecting (e.g. a pipe going through a beam).

If check_all is False, the clash check will return as soon as an intersection is found. This is faster but may not return the worst-case protrusion distance. If you are not interested in the protrusion distance, it is recommended to set this to False. If you want the protrusion distance, such as to prioritise which clashes are more severe, set this to True.

This includes:

When an element X protrudes inside element Y, where element Y is manifold. In this case, a protrusion distance is calculated as the deepest point of element X to the closest surface of element Y. P1 is defined as the XYZ coordinate on element X, and P2 is defined as the nearest point on the surface of element Y.

When an element X pierces element Y, such that an edge of element X enters element Y and leaves through another face. In this case, a piercing distance is calculated as the distance where that edge is inside element Y. P1 is defined as the point on an edge of element X which enters element Y, and P2 is the point where that edge leaves element Y.

When neither X or Y is manifold, we cannot detect protrusion or piercing, so instead when X and Y have any touching face. This is the same as the clash_collision_many check below. The distance is considered to be zero and ignores your specified tolerance. P1 and P2 are equal and represent an arbitrary XYZ point where the two elements touch.

Detecting collision clashes between elements

clash_collision_many detects when the surface of an element collides with another element. The surfaces may either merely touch (e.g. are coplanar) or intersect.

clashes = tree.clash_collision_many(
group_a_elements, # e.g. from model.by_type("IfcWall")
group_b_elements, # Group b can be the same as group a if you want to clash within a single set
allow_touching=True, # Include results where faces merely touch but do not intersect
)

for clash in clashes: # Get the two elements that clash and their metadata
element1 = clash.a
element2 = clash.b
a_global_id = element1.get_argument(0)
b_global_id = element2.get_argument(0)
a_ifc_class = element1.is_a()
b_ifc_class = element2.is_a()
a_name = element1.get_argument(2)
b_name = element2.get_argument(2)

    # P1 and P2 represents two possible arbitrary points where a collision is found.
    # P1 may or may not be equal to P2.
    p1 = list(clash.p1)
    p2 = list(clash.p2)

A collision between two surface triangles may be “touching” or “intersecting”. Two touching triangles may be coplanar or merely have a single edge or vertex touching the other triangle. An intersecting triangle will have at least one edge that goes through the other triangle.

Detecting clearance clashes between elements

clash_clearance_many detects with the surface of an element comes within a clearance distance threshold of another element.

clashes = tree.clash_clearance_many(
group_a_elements, # e.g. from model.by_type("IfcWall")
group_b_elements, # Group b can be the same as group a if you want to clash within a single set
clearance=0.1, # Any surface closer than than 100mm is a clash
check_all=False, # Stop measuring distances once the first clearance violation is found per element.
)

for clash in clashes: # Get the two elements that clash and their metadata
element1 = clash.a
element2 = clash.b
a_global_id = element1.get_argument(0)
b_global_id = element2.get_argument(0)
a_ifc_class = element1.is_a()
b_ifc_class = element2.is_a()
a_name = element1.get_argument(2)
b_name = element2.get_argument(2)

    # P1 and P2 represents the two XYZ coordinates between element1 and element2.
    p1 = list(clash.p1)
    p2 = list(clash.p2)

    # This represents the distance between element1 and element2 that is less than the clearance.
    # It is the distance between P1 and P2. It cannot be less than 0.
    distance = clash.distance

You cannot specify a clearance less than 0.

If check_all is False, the clash check will return as soon as a clearance violation is found. This is faster but may not return the worst-case distance. If you only interested whether there is a clearance issue, it is recommended to set this to False. If you want the exact worst case clearance distance, such as to prioritise which clashes are more severe, set this to True.

Selecting elements using bounding boxes

Elements may be queried using an axis aligned bounding box. An axis aligned bounding box is the bounding box using global XYZ axes, not the element’s local XYZ axes. If you have a vertical construction project, this means that your model should be oriented to project north to get the best results.

You may select all elements that have a bounding box containing the point with XYZ coordinates of (0., 0., 0.).

# This will return a list of elements.

# E.g.: [#66=IfcFurniture('3I53aQSFrFhRRaMHWNp8pD', ...), #96=IfcFurniture('0t5avJ3o956wj73wyBw0nO', ...)]

elements = tree.select_box((0., 0., 0.))

Note

All coordinates and length arguments must be specified in meters.

You may select all elements based on another element’s bounding box. It will return:

The queried element itself (i.e. a wall in this example)

Any elements fully contained by the wall

Any elements fully containing the wall

Any elements intersecting the wall

wall = ifc_file.by_type("IfcWall")[0]
elements = tree.select_box(wall)

You may also select elements that are completely within another element’s bounding box. It will return:

The queried element itself (i.e. a wall in this example)

Any elements fully contained by the wall

elements = tree.select_box(wall, completely_within=True)

# Alternatively, you may also specify an extension to dilate the bounding

# box of the wall.

elements = tree.select_box(wall, completely_within=True, extend=5.)

Selecting elements using precise geometry

You may select all elements that have geometry containing the point with XYZ coordinates of (0., 0., 0.).

elements = tree.select((0., 0., 0.))

Note

All coordinates and length arguments must be specified in meters.

You may also select all elements that have geometry intsecting with a sphere, represented by a centerpoint and a radius. This will return:

Any elements fully contained by the sphere

Any elements intersecting the sphere

# This extension is also in meters.

elements = tree.select((0., 0., 0.), extend=5.)

You may select all elements based on another element’s geometry. It will return:

The queried element itself (i.e. a wall in this example)

Any elements fully contained by the wall

Any elements fully containing the wall

Any elements intersecting the wall

wall = ifc_file.by_type("IfcWall")[0]
elements = tree.select(wall)

You may also select elements that are completely within another element’s geometry. It will return:

The queried element itself (i.e. a wall in this example)

Any elements fully contained by the wall

elements = tree.select(wall, completely_within=True)

# Alternatively, you may also specify an extension to dilate the geometry

# of the wall.

elements = tree.select(wall, completely_within=True, extend=5.)

Selecting elements using a ray

You may select all elements that intersect with a ray. A ray is not infinite, but instead must have a length. The default length is 1000 meters.

This returns a list of ray intersection results, which contain information about the element it intersects with along with the point of intersection. This may mean that the same element is returned multiple times if it intersects multiple times.

origin = (0., 0., 0.)
direction = (1., 0., 0.)
results = tree.select_ray(origin, direction, length=5.)

for result in results:
print(ifc_file.by_id(result.instance.id())) # The element the ray intersects with
print(list(result.position)) # The XYZ intersection point
print(result.distance) # The distance between the ray origin and the intersection
print(list(result.normal)) # The normal of the face being intersected
print(result.dot_product) # The dot product of the face being intersected with the ray

Selector syntax

A common task in querying IFC models is to filter or search for elements which match particular criteria. For example, you might want to find all plasterboard walls with a 2 hour fire rating on level 3.

Alternatively, you might want to fetch some data about a single element. For example, you might want to fetch the fire rating property of an element, or the type description of an element, or the net volume of a list of elements.

Once you’ve retreived your data, you might want to format it in some way. You might want to ensure that all names are always uppercase. Or you might want to take length values defined in feet, and apply imperial formatting such that it shows both feet and inches including fractions.

These three usecases of filtering, getting a value, and formatting that value are common and used in many utilities, such as in Bonsai, IfcCSV, IfcDiff, IfcClash, IfcPatch, and IfcFM.

IfcOpenShell provides a custom syntax to consistently and concisely describe filters, value queries, and formatting rules.

Filtering elements

Filtering is typically used to select any IFC element or type.

import ifcopenshell
import ifcopenshell.util.selector

model = ifcopenshell.open("model.ifc")

# Get all concrete walls and slabs.

ifcopenshell.util.selector.filter_elements(model, "IfcWall, IfcSlab, material=concrete")

Example Query

Description

IfcElement

All physical IfcElements including subclasses like walls, doors, windows, etc. Yep, that’s it! Nothing else. Literally just IfcElement.

IfcWall, IfcSlab

All walls and slabs. Technically, this is either a wall or a slab, but it’s easier to describe it as all walls and slabs

IfcWall, IfcSlab, material=concrete

All walls made out of concrete and slabs made out of concrete. The material checks any assigned IfcMaterial with a matching name or category attribute.

325Q7Fhnf67OZC$$r43uzK

A single element. Yep, just the GlobalId, nothing else! Easy.

325Q7Fhnf67OZC$$r43uzK, 2VlJ7nbF5AFfQQuRvSWexT

A bunch of arbitrary elements.

IfcWall, ! 325Q7Fhnf67OZC$$r43uzK

All walls except that one element.

IfcElement, ! IfcWall

All elements except for walls.

IfcDoor, Name=D01

Any doors named D01, notice how attributes match the IFC Attribute naming exactly

IfcDoor, Name=/D[0-9]{2}/

Any doors with the naming scheme of D followed by two numbers:

IfcWall, Pset_WallCommon.FireRating=2HR

Any 2 hour fire rated wall

IfcWall, IfcColumn, IfcBeam, IfcFooting, /Pset\_.\*Common/.LoadBearing=TRUE

Any load bearing structure

IfcElement, /Pset\_.\*Common/.FireRating != NULL

Any element with a fire rating property

IfcWall, type=WT01, location="Level 3"

Any walls of wall type WT01 on level 3 (we quote Level 3 since it has a space)

IfcElement, classification=/Pr\_.\*/

Any maintainable product according to Uniclass tables

IfcWall, IfcSlab, ! 325Q7Fhnf67OZC$$r43uzK, material=concrete, /Pset\_.\*Common/.FireRating=2HR

Notice how there are intuitive rules that class and instance filters are OR whereas other filters are AND So here is any wall or slab except that one element that has a material of concrete and has a 2 hour fire rating

IfcSlab, material=concrete + IfcDoor

Finally, you can union facet lists together. So here is all concrete slabs, as well as all doors (regardless of concrete)

IfcDoor, IfcWindow + IfcWall, IfcSlab, material=concrete + 325Q7Fhnf67OZC$$r43uzK

Here’s another example of unioning facet groups. All doors and window, and all concrete walls and slabs, plus that one random element

IfcPump, location="Level 3"

Locations bubble up the hierarchy. So if a pump is in a space and that space is on Level 3, then you can say “all pumps on level 3” which will include that pump in the space.

The filter elements syntax works by specifying one or more groups of filters separated by a + character. Each filter group will return a set of filtered elements, and these are unioned together.

filter_group[ + filter_group]\*

A filter group consists of one or more filters separated by a , character. The filters are chained and apply from left to right.

filter[, filter]\*

There are nine types of filters to choose from. Some of these filters will add new elements to your filter group, and some will filter previously added elements in your filter group based on their criteria.

Filter

Type

Usage

Example

Class

Add

[!] {{ifc_class_name}}

IfcWall adds all IfcWall elements and their subclasses. ! IfcWall subtracts all non-IfcWall elements from the filter group.

GlobalId

Add

[!] {{global_id}}

325Q7Fhnf67OZC$$r43uzK adds the single element with that GlobalId attribute. ! 325Q7Fhnf67OZC$$r43uzK subtracts that single element.

Attribute

Filter

{{name}}{{=}}{{value}}

Name=Foo specifies the criteria that elements must have a Name attribute with a value of Foo. Attribute names must be spelled exactly the same as in IFC, which means that they must start with an uppercase character.

Property

Filter

{{pset}}.{{prop}}{{=}}{{value}}

Pset_WallCommon.FireRating=2HR specifies the criteria that elements must have a Pset_WallCommon property set, with a FireRating property within it with a value of 2HR. The property set name and the property name are separated by a ..

Type

Filter

type{{=}}{{value}}

type=Foo specifies the criteria that elements must have a type which has a Name attribute with a value of Foo.

Material

Filter

material{{=}}{{value}}

material=Foo specifies the criteria that elements must have a IfcMaterial assigned directly or indirectly (such as within a layer set). That IfcMaterial must have either a Name or Category attribute with a value of Foo.

Classification

Filter

classification{{=}}{{value}}

classification=Foo specifies the criteria that elements must have an IfcClassificationReference with an Identification attribute with a value of Foo.

Location

Filter

location{{=}}{{value}}

location=Foo specifies the criteria that elements must be contained directly or indirectly in a spatial element with a Name attribute with a value of Foo.

Parent

Filter

parent{{=}}{{value}}

parent=Foo specifies the criteria that elements must be a direct or indirect child in the spatial hierarchy to an element with a Name attribute with a value of Foo.

Query

Filter

query:{{keys}}{{=}}{{value}}

query:types.count=0 specifies the criteria that elements must have zero type occurrences. The query keys corresponds to the syntax used in the Getting element values section

When you specify a filter with a {{=}} check, you can choose from one of the following comparison checks:

Comparison

Description

=

Must equal the value. The data type of the value is automatically converted to match.

!=

Must not equal the value.

>

Must be greater than the value.

> =

Must be greater than or equal to the value.

<

Must be less than the value.

<=

Must be less than or equal to the value.

\*=

Must contain the value.

!\*=

Must not contain the value.

When you specify a {{pset}}, {{prop}}, or {{value}}, there are three ways you can do so:

Value Type

Example

Description

Quoted string

"foo \"bar\" baz"

The value must be in double quotes. The value may contain spaces, symbols, and other characters. If you need to use a double quote, you can escape it with a backslash. This is the safest, most general way to specify a value.

Unquoted string

foobarbaz

For convenience, if you have a simple value which contains no spaces or special characters, you are free to specify it as an unquoted string.

Regex string

/foo.\*baz/

You may specify a Python-compatible regex pattern delimited by forward slashes. You can learn more about regular expressions from Beginners Regex tutorial and Online Regex testing website.

Getting element values

Given a single element, this syntax provides a simple way to extract a value without needing to write complex code for it.

import ifcopenshell
import ifcopenshell.util.selector

# Get the Name attribute of the wall's type.

ifcopenshell.util.selector.get_element_value(wall, "type.Name")

Example Query

Description

class

Get the IFC class of the element.

Name

Get the Name attribute.

Pset_WallCommon.Status

Get the value of the Status property in the Pset_WallCommon property set.

/Pset\_.\*Common/.Status

Get the value of the Status property in the any common property set.

type.Name

Get the Name attribute of the element’s relating type.

types.count

Count the number of occurrences of a type.

storey.Name

Get the Name attribute of the storey that the element is contained in.

materials.count

Count the number of materials assigned to an element.

material.Name

Get the name of the assigned material.

material.item.0.Name

Get the name of the first item in a material set (e.g. the first material layer)

The element value syntax works by specifying one or more query keys separated by a . character. Each query key returns data based of the results of the previous key.

key[.key]\*

Valid keys are:

Key

Description

id

Gets the IFC ID (equivalent to .id())

class

Gets the IFC class (equivalent to .is_a())

predefined_type

Gets the predefined type of the element, taking into account inheritance.

{{attribute}}

Gets the value of the attribute you specify. Attributes always start with an uppercase letter.

{{pset}}

This gets the property set with the same name specified in {{pset}}. Note that this can be ambiguous with {{attribute}}. If there is an ambiguity, {{attribute}} takes priority.

{{prop}}

If the previous key returns a property set, {{prop}} gets the value of a property with the same name specified in {{prop}}. For this reason, often you specify both keys together, like this: {{pset}}.{{prop}}.

type

Gets the relating type of an element occurrence.

types or occurrences

Gets the related objects of an element type.

container

Gets the immediate spatial element that an element is contained in.

space

Gets the first IfcSpace spatial element that an element is contained in.

storey

Gets the first IfcBuildingStorey spatial element that an element is contained in.

building

Gets the first IfcBuilding spatial element that an element is contained in.

site

Gets the first IfcSite spatial element that an element is contained in.

parent

Gets the parent element in the spatial hierarchy.

classification

Gets the element’s classification reference(s)

group

Gets the element’s group(s)

system

Gets the element’s system(s). This is a subset of group(s).

material or mat

Gets the assigned material, which may be a material set.

item or i

If the previous key returns a material set, gets the relevant material set items

materials or mats

Gets a list of IfcMaterials assigned directly or indirectly (such as via a material set) to the element

profiles

Gets a list of IfcProfileDefs assigned (such as via a material profile) or used (such as in an extrusion) in the element

x

Gets the X coordinate of the element’s placement

y

Gets the Y coordinate of the element’s placement

z

Gets the Z coordinate of the element’s placement

easting

Gets the map easting of the element’s placement

northing

Gets the map northing of the element’s placement

elevation

Gets the map elevation of the element’s placement

count

If the previous key returns multiple things, count that list. Otherwise, return 1.

{{number}}

If the previous key returns multiple things, fetch the {{number}} index (e.g. 0, 1, 2, 3, etc) item in that list.

When you specify a {{pset}} or {{prop}}, there are three ways you can do so:

Value Type

Example

Description

Quoted string

"foo \"bar\" baz"

The value must be in double quotes. The value may contain spaces, symbols, and other characters. If you need to use a double quote, you can escape it with a backslash. This is the safest, most general way to specify a value.

Unquoted string

foobarbaz

For convenience, if you have a simple value which contains no spaces or special characters, you are free to specify it as an unquoted string.

Regex string

/foo.\*baz/

You may specify a Python-compatible regex pattern delimited by forward slashes. You can learn more about regular expressions from Beginners Regex tutorial and Online Regex testing website.

Formatting

Given a value, this syntax allows a simple way to specify a set of formatting rules. This is useful for configuring outputs of how data should be presented.

import ifcopenshell
import ifcopenshell.util.selector

# Get the Name attribute of the wall's type.

value = ifcopenshell.util.selector.get_element_value(wall, "type.Name")

# Always display names in uppercase.

ifcopenshell.util.selector.format(f'upper("{value}")')

Formatting queries are written similar to how you’d write functions or formulas in spreadsheets. For example upper("foo") will produce FOO. You may nest formulas, for example concat(title("foo"), lower("Bar")) will produce Foobar. Strings must be double quoted.

Function

Example

Result

Description

upper({{value}})

upper("Foo")

FOO

Uppercases a string.

lower({{value}})

lower("Foo")

foo

Lowercases a string.

title({{value}})

title("foo")

Foo

Titlecases a string.

concat({{value}}[, {{value2}}]\*)

concat("foo", "bar")

foobar

Concatenates two or more strings.

round({{value}}, {{precision}})

round(3.123, 0.1)

3.1

Rounds {{value}} to the nearest {{precision}}.

number({{value}}[, {{decimal_separator}}[, {{thousands_separator}}]])

number(1234.56, ",", ".")

1.234,56

Formats {{value}} with an optional custom {{decimal_separator}} and {{thousands_separator}}. The default separators are . and ,.

metric_length({{value}}, {{precision}}, {{decimals}})

metric_length(3.123, 0.1, 2)

3.10

Rounds {{value}} to the nearest {{precision}} then displays using a certain amount of decimal places.

imperial_length({{value}}, {{precision}}, {{input_unit}}, {{output_unit}})

imperial_length(3.22, 4, "foot")

3' - 3 3/4"

The {{value}} may be specified either as foot or inch depending on {{input_unit}}. The {{value}} is then rounded to the nearest 1/{{precision}} inch then formatted using fractional feet and inches if {{output_unit}} is set to foot or just inches if {{output_unit}} is set to inch.

ifcopenshell

Welcome to IfcOpenShell! IfcOpenShell provides a way to read and write IFCs.

IfcOpenShell can open IFC files, read entities (such as walls, buildings, properties, systems, etc), edit attributes, write out .ifc files and more.

This module provides primitive functions to interact with IFC, including:

For most users, you can open and read IFC models, see docs for open(). This returns an file object representing the IFC model. You can then query the model to filter elements.

For developers, you can query the schema itself, see docs for schema_by_name(). This returns a schema object which you can use to analyse the definitions of IFC classes and data types.

You may also be interested in:

For model authoring and editing operations, see ifcopenshell.api.

For extracting information from models, see ifcopenshell.util.

For processing geometry, see ifcopenshell.geom.

For more details, consult https://docs.ifcopenshell.org/

Example:

import ifcopenshell

print(ifcopenshell.version)

model = ifcopenshell.open("/path/to/model.ifc")
walls = model.by_type("IfcWall")

for wall in walls:
print(wall.Name)

Subpackages
ifcopenshell.api
ifcopenshell.express
ifcopenshell.geom
ifcopenshell.util
Submodules
ifcopenshell.alignment
ifcopenshell.draw
ifcopenshell.entity_instance
ifcopenshell.file
ifcopenshell.guid
ifcopenshell.settings
ifcopenshell.sql
ifcopenshell.stream
ifcopenshell.template
ifcopenshell.transition_curve
ifcopenshell.validate
Package Contents
class ifcopenshell.file(f: ifcopenshell.ifcopenshell_wrapper.file | None = None, schema: str | None = None, schema_version: tuple[int, int, int, int] | None = None)

Base class for containing IFC files.

Class has instance methods for filtering by element Id, Type, etc. Instantiated objects can be subscripted by Id or Guid

Example:

model = ifcopenshell.open(file_path)
products = model.by_type("IfcProduct")
print(products[0].id(), products[0].GlobalId) # 122 2XQ$n5SLP5MBLyL442paFx
print(products[0] == model[122] == model["2XQ$n5SLP5MBLyL442paFx"]) # True

Create a new blank IFC model

This IFC model does not have any entities in it yet. See the create_entity function for how to create new entities. All data is stored in memory. If you wish to write the IFC model to disk, see the write function.

PARAMETERS:

f – The underlying IfcOpenShell file object to be wrapped. This is an internal implementation detail and should generally be left as None by users.

schema (string) – Which IFC schema to use, chosen from “IFC2X3”, “IFC4”, or “IFC4X3”. These refer to the ISO approved versions of IFC. Defaults to “IFC4” if not specified, which is currently recommended for all new projects.

schema_version (tuple[int, int, int, int]) – If you want to specify an exact version of IFC that may not be an ISO approved version, use this argument instead of schema. IFC versions on technical.buildingsmart.org are described using 4 integers representing the major, minor, addendum, and corrigendum number. For example, (4, 0, 2, 1) refers to IFC4 ADD2 TC1, which is the official version approved by ISO when people refer to “IFC4”. Generally you should not use this argument unless you are testing non-ISO IFC releases.

Example:

# Create a new IFC4 model, create a wall, then save it to an IFC-SPF file.

model = ifcopenshell.file()
model.create_entity("IfcWall")
model.write("/path/to/model.ifc")

# Create a new IFC4X3 model

model = ifcopenshell.file(schema="IFC4X3")

# A poweruser testing out a particular version of IFC4X3

model = ifcopenshell.file(schema_version=(4, 3, 0, 1))

add(inst: ifcopenshell.entity_instance, \_id: int = None) → ifcopenshell.entity_instance

Adds an entity including any dependent entities to an IFC file. If the entity already exists, it is not re-added. Existence of entity is checked by it’s .identity().

PARAMETERS:

inst (ifcopenshell.entity_instance) – The entity instance to add

RETURNS:

An ifcopenshell.entity_instance

RETURN TYPE:

ifcopenshell.entity_instance

batch()

Low-level mechanism to speed up deletion of large subgraphs

begin_transaction() → None
by_guid(guid: str) → ifcopenshell.entity_instance

Return an IFC entity instance filtered by IFC GUID.

PARAMETERS:

guid (string) – GlobalId value in 22-character encoded form

RAISES:

RuntimeError – If guid is not found.

RETURNS:

An ifcopenshell.entity_instance

RETURN TYPE:

ifcopenshell.entity_instance

by_id(id: int) → ifcopenshell.entity_instance

Return an IFC entity instance filtered by IFC ID.

PARAMETERS:

id (int) – STEP numerical identifier

RAISES:

RuntimeError – If id is not found.

RETURNS:

An ifcopenshell.entity_instance

RETURN TYPE:

ifcopenshell.entity_instance

by_type(type: str, include_subtypes=True) → list[ifcopenshell.entity_instance]

Return IFC objects filtered by IFC Type and wrapped with the entity_instance class.

If an IFC type class has subclasses, all entities of those subclasses are also returned.

PARAMETERS:

type (string) – The case insensitive type of IFC class to return.

include_subtypes (bool) – Whether or not to return subtypes of the IFC class

RAISES:

RuntimeError – If type is not found in IFC schema.

RETURNS:

A list of ifcopenshell.entity_instance objects

RETURN TYPE:

list[ifcopenshell.entity_instance]

create_entity(type: str, \*args, \*\*kwargs) → ifcopenshell.entity_instance

Create a new IFC entity in the file.

You can also use dynamic methods similar to ifc_file.createIfcWall(…) to create IFC entities. They work exactly the same as if you would do ifc_file.create_entity(“IfcWall”, …) but the resulting typing is not as accurate as for create_entity due to a dynamic nature of those methods.

PARAMETERS:

type (string) – Case insensitive name of the IFC class

args – The positional arguments of the IFC class

kwargs – The keyword arguments of the IFC class

RETURNS:

An entity instance

RETURN TYPE:

ifcopenshell.entity_instance

Example:

f = ifcopenshell.file()
f.create_entity("IfcPerson")

# >>> #1=IfcPerson($,$,$,$,$,$,$,$)

f.create_entity("IfcPerson", "Foobar")

# >>> #2=IfcPerson('Foobar',$,$,$,$,$,$,$)

f.create_entity("IfcPerson", Identification="Foobar")

# >>> #3=IfcPerson('Foobar',$,$,$,$,$,$,$)

discard_transaction() → None
end_transaction() → None
static from_pointer(v) → file
static from_string(s: str) → file
get_inverse(inst: ifcopenshell.entity_instance, allow_duplicate: bool = False, with_attribute_indices: bool = False) → list[ifcopenshell.entity_instance]

Return a list of entities that reference this entity

Warning: this is a slow function, especially when there is a large number of inverses (such as for a shared owner history). If you are only interested in the total number of inverses (typically 0, 1, or N), consider using get_total_inverses().

PARAMETERS:

inst (ifcopenshell.entity_instance) – The entity instance to get inverse relationships

allow_duplicate – Returns a list when True, set when False

with_attribute_indices – Returns pairs of <i, idx> where i[idx] is inst or contains inst. Requires allow_duplicate=True

RETURNS:

A list of ifcopenshell.entity_instance objects

RETURN TYPE:

list[ifcopenshell.entity_instance]

get_total_inverses(inst: ifcopenshell.entity_instance) → int

Returns the number of entities that reference this entity

This is equivalent to len(model.get_inverse(element)), but significantly faster.

PARAMETERS:

inst (ifcopenshell.entity_instance) – The entity instance to get inverse relationships

RETURNS:

The total number of references

RETURN TYPE:

int

redo() → None
remove(inst: ifcopenshell.entity_instance) → None

Deletes an IFC object in the file.

Attribute values in other entity instances that reference the deleted object will be set to null. In the case of a list or set of references, the reference to the deleted will be removed from the aggregate.

PARAMETERS:

inst (ifcopenshell.entity_instance) – The entity instance to delete

RETURN TYPE:

None

set_history_size(size: int) → None
traverse(inst: ifcopenshell.entity_instance, max_levels=None, breadth_first=False) → list[ifcopenshell.entity_instance]

Get a list of all referenced instances for a particular instance including itself

PARAMETERS:

inst (ifcopenshell.entity_instance) – The entity instance to get all sub instances

max_levels (bool) – How far deep to recursively fetch sub instances. None or -1 means infinite.

breadth_first – Whether to use breadth-first search, the default is depth-first.

RETURNS:

A list of ifcopenshell.entity_instance objects

RETURN TYPE:

list[ifcopenshell.entity_instance]

unbatch()

Low-level mechanism to speed up deletion of large subgraphs

undo() → None
write(path: os.PathLike | str, format: str | None = None, zipped: bool = False) → None

Write ifc model to file.

:param format: Force use of a specific format. Guessed from file name

if None. Supported formats : .ifc, .ifcXML, .ifcZIP (equivalent to format=”.ifc” with zipped=True) For zipped .ifcXML use format=”.ifcXML” with zipped=True

:param zipped: zip the file after it is written :type zipped: bool

Example:

model.write("path/to/model.ifc")
model.write("path/to/model.ifcXML")
model.write("path/to/model.ifcZIP")
model.write("path/to/model.ifcZIP", format=".ifcXML", zipped=True)
model.write("path/to/model.anyextension", format=".ifcXML")

future = []
history = []
history_size = 64
property schema: Literal['IFC2X3', 'IFC4', 'IFC4X3']

General IFC schema version: IFC2X3, IFC4, IFC4X3.

property schema_identifier: str

Full IFC schema version: IFC2X3_TC1, IFC4_ADD2, IFC4X3_ADD2, etc.

property schema_version: tuple[int, int, int, int]

Numeric representation of the full IFC schema version.

E.g. IFC4X3_ADD2 is represented as (4, 3, 2, 0).

transaction: Transaction | None = None
wrapped_data: ifcopenshell.ifcopenshell_wrapper.file
class ifcopenshell.sqlite(filepath)

Bases: ifcopenshell.file.file

Base class for containing IFC files.

Class has instance methods for filtering by element Id, Type, etc. Instantiated objects can be subscripted by Id or Guid

Example:

model = ifcopenshell.open(file_path)
products = model.by_type("IfcProduct")
print(products[0].id(), products[0].GlobalId) # 122 2XQ$n5SLP5MBLyL442paFx
print(products[0] == model[122] == model["2XQ$n5SLP5MBLyL442paFx"]) # True

Create a new blank IFC model

This IFC model does not have any entities in it yet. See the create_entity function for how to create new entities. All data is stored in memory. If you wish to write the IFC model to disk, see the write function.

PARAMETERS:

f – The underlying IfcOpenShell file object to be wrapped. This is an internal implementation detail and should generally be left as None by users.

schema (string) – Which IFC schema to use, chosen from “IFC2X3”, “IFC4”, or “IFC4X3”. These refer to the ISO approved versions of IFC. Defaults to “IFC4” if not specified, which is currently recommended for all new projects.

schema_version (tuple[int, int, int, int]) – If you want to specify an exact version of IFC that may not be an ISO approved version, use this argument instead of schema. IFC versions on technical.buildingsmart.org are described using 4 integers representing the major, minor, addendum, and corrigendum number. For example, (4, 0, 2, 1) refers to IFC4 ADD2 TC1, which is the official version approved by ISO when people refer to “IFC4”. Generally you should not use this argument unless you are testing non-ISO IFC releases.

Example:

# Create a new IFC4 model, create a wall, then save it to an IFC-SPF file.

model = ifcopenshell.file()
model.create_entity("IfcWall")
model.write("/path/to/model.ifc")

# Create a new IFC4X3 model

model = ifcopenshell.file(schema="IFC4X3")

# A poweruser testing out a particular version of IFC4X3

model = ifcopenshell.file(schema_version=(4, 3, 0, 1))

by_id(id)

Return an IFC entity instance filtered by IFC ID.

PARAMETERS:

id (int) – STEP numerical identifier

RAISES:

RuntimeError – If id is not found.

RETURNS:

An ifcopenshell.entity_instance

RETURN TYPE:

ifcopenshell.entity_instance

by_type(type, include_subtypes=True)

Return IFC objects filtered by IFC Type and wrapped with the entity_instance class.

If an IFC type class has subclasses, all entities of those subclasses are also returned.

PARAMETERS:

type (string) – The case insensitive type of IFC class to return.

include_subtypes (bool) – Whether or not to return subtypes of the IFC class

RAISES:

RuntimeError – If type is not found in IFC schema.

RETURNS:

A list of ifcopenshell.entity_instance objects

RETURN TYPE:

list[ifcopenshell.entity_instance]

clear_cache()
create_entity(type, \*args, \*\*kawrgs)

Create a new IFC entity in the file.

You can also use dynamic methods similar to ifc_file.createIfcWall(…) to create IFC entities. They work exactly the same as if you would do ifc_file.create_entity(“IfcWall”, …) but the resulting typing is not as accurate as for create_entity due to a dynamic nature of those methods.

PARAMETERS:

type (string) – Case insensitive name of the IFC class

args – The positional arguments of the IFC class

kwargs – The keyword arguments of the IFC class

RETURNS:

An entity instance

RETURN TYPE:

ifcopenshell.entity_instance

Example:

f = ifcopenshell.file()
f.create_entity("IfcPerson")

# >>> #1=IfcPerson($,$,$,$,$,$,$,$)

f.create_entity("IfcPerson", "Foobar")

# >>> #2=IfcPerson('Foobar',$,$,$,$,$,$,$)

f.create_entity("IfcPerson", Identification="Foobar")

# >>> #3=IfcPerson('Foobar',$,$,$,$,$,$,$)

get_geometry(ids: list[int]) → dict[str, dict]
get_inverse(inst, allow_duplicate=False, with_attribute_indices=False)

Return a list of entities that reference this entity

Warning: this is a slow function, especially when there is a large number of inverses (such as for a shared owner history). If you are only interested in the total number of inverses (typically 0, 1, or N), consider using get_total_inverses().

PARAMETERS:

inst (ifcopenshell.entity_instance) – The entity instance to get inverse relationships

allow_duplicate – Returns a list when True, set when False

with_attribute_indices – Returns pairs of <i, idx> where i[idx] is inst or contains inst. Requires allow_duplicate=True

RETURNS:

A list of ifcopenshell.entity_instance objects

RETURN TYPE:

list[ifcopenshell.entity_instance]

is_entity_list(attribute)
preprocess_schema()
traverse(inst, max_levels=None, breadth_first=False)

Get a list of all referenced instances for a particular instance including itself

PARAMETERS:

inst (ifcopenshell.entity_instance) – The entity instance to get all sub instances

max_levels (bool) – How far deep to recursively fetch sub instances. None or -1 means infinite.

breadth_first – Whether to use breadth-first search, the default is depth-first.

RETURNS:

A list of ifcopenshell.entity_instance objects

RETURN TYPE:

list[ifcopenshell.entity_instance]

class_map
cursor
db
entity_cache
filepath
future = []
history = []
history_size = 64
id_map
ifc_schema
row_factory
schema

General IFC schema version: IFC2X3, IFC4, IFC4X3.

transaction = None
wrapped_data = None
class ifcopenshell.sqlite_entity(id, ifc_class, file=None)

Bases: ifcopenshell.entity_instance.entity_instance

Represents an entity (wall, slab, property, etc) of an IFC model

An IFC model consists of entities. Examples of entities include walls, slabs, doors and so on. Entities can also be non-physical things, like properties, systems, construction tasks, colours, geometry, and more.

Entities are defined through an IFC Class. There are hundreds of IFC Classes defined as part of the ISO standard by the buildingSMART International organisation. The IFC Class defines the attributes of an entity, as well as the data types and whether or not an attribute is mandatory or optional.

IfcOpenShell’s API dynamically implements the IFC schema. You will not find documentation about available IFC Classes, or what attributes they have. Please consult the buildingSMART official documentation or start reading Introduction to IFC.

In addition to the Python methods you see documented here, an instantiated entity_instance will have attributes defined by its IFC class. For example, an entity instance which is an IfcWall class will have a Name attribute, and an IfcColourRgb will have a Red attribute. Please consult the buildingSMART official documentation.

Example:

model = ifcopenshell.open(file_path)
walls = model.by_type("IfcWall")
wall = walls[0]

print(wall) # #38=IFCWALL('2MEinnTPbCMwLOgceaQZFu',$,$,'My Wall',$,#52,#47,$,$);
print(wall.is_a()) # IfcWall

# Note: the `Name` attribute is dynamic, based on the IFC class.

print(wall.Name) # My Wall

# Attributes are ordered and may also be accessed via index.

print(wall[3]) # My Wall

print(wall.**class**) # <class 'ifcopenshell.entity_instance'>

get_info(include_identifier=True, recursive=False, return_type=dict, ignore=(), scalar_only=False)

Return a dictionary of the entity_instance’s properties (Python and IFC) and their values.

PARAMETERS:

include_identifier (bool) – Whether or not to include the STEP numerical identifier

recursive (bool) – Whether or not to convert referenced IFC elements into dictionaries too. All attributes also apply recursively

return_type (dict|list|other) – The return data type to be casted into

ignore (set|list) – A list of attribute names to ignore

scalar_only (bool) – Filters out all values that are IFC instances

RETURNS:

A dictionary of properties and their corresponding values

RETURN TYPE:

dict

Example:

ifc_file = ifcopenshell.open(file_path)
products = ifc_file.by_type("IfcProduct")
obj_info = products[0].get_info()
print(obj_info.keys())

> > > dict_keys(['Description', 'Name', 'BuildingAddress', 'LongName', 'GlobalId', 'ObjectPlacement', 'OwnerHistory', 'ObjectType',
> > >
> > > > > > ...'ElevationOfTerrain', 'CompositionType', 'id', 'Representation', 'type', 'ElevationOfRefHeight'])

id()

Return the STEP numerical identifier

RETURN TYPE:

int

unserialise_value(value)

ifcopenshell.api
High level IFC authoring and editing functions

Authoring, editing, and deleting IFC data requires a detailed understanding of the rules of the IFC schema. This API module provides simple to use authoring functions that hide this complexity from you. Things like managing differences between IFC versions, tracking owernship changes, or cleaning up after orphaned relationships are all handled automatically.

If you’re new to IFC authoring, start by looking at the following APIs:

See ifcopenshell.api.project.create_file() to create a new IFC.

See ifcopenshell.api.root.create_entity() to create new entities, like the mandatory IfcProject, and then an IfcSite, IfcWall, etc.

See ifcopenshell.api.aggregate.assign_object() to create a spatial hierarchy.

See ifcopenshell.api.spatial.assign_container() to place physical elements (e.g. walls) inside spatial elements (e.g. building storeys).

Also see how to create a simple model from scratch.

Subpackages
ifcopenshell.api.aggregate
ifcopenshell.api.attribute
ifcopenshell.api.boundary
ifcopenshell.api.classification
ifcopenshell.api.constraint
ifcopenshell.api.context
ifcopenshell.api.control
ifcopenshell.api.cost
ifcopenshell.api.document
ifcopenshell.api.drawing
ifcopenshell.api.geometry
ifcopenshell.api.georeference
ifcopenshell.api.grid
ifcopenshell.api.group
ifcopenshell.api.layer
ifcopenshell.api.library
ifcopenshell.api.material
ifcopenshell.api.nest
ifcopenshell.api.owner
ifcopenshell.api.profile
ifcopenshell.api.project
ifcopenshell.api.pset
ifcopenshell.api.pset_template
ifcopenshell.api.resource
ifcopenshell.api.root
ifcopenshell.api.sequence
ifcopenshell.api.spatial
ifcopenshell.api.structural
ifcopenshell.api.style
ifcopenshell.api.system
ifcopenshell.api.type
ifcopenshell.api.unit
ifcopenshell.api.void
Package Contents
ifcopenshell.api.add_post_listener(usecase_path: str, name: str, callback: Callable[[str, ifcopenshell.file, dict], None]) → None
Add a post listener

Parameters:
usecase_path – string, ifcopenshell api use case path

name – string, name of listener

callback – callback function with 3 arguments: usecase_path, ifc_file, settings

ifcopenshell.api.add_pre_listener(usecase_path: str, name: str, callback: Callable[[str, ifcopenshell.file, dict], None]) → None
Add a pre listener

Parameters:
usecase_path – string, ifcopenshell api use case path

name – string, name of listener

callback – callback function with 3 arguments: usecase_path, ifc_file, settings

ifcopenshell.api.extract_docs(module, usecase)
ifcopenshell.api.remove_all_listeners()
ifcopenshell.api.remove_post_listener(usecase_path: str, name: str, callback: Callable[[str, ifcopenshell.file, dict], None]) → None
Remove a post listener

Parameters:
usecase_path – string, ifcopenshell api use case path

name – string, name of listener

callback – callback function with 3 arguments: usecase_path, ifc_file, settings

ifcopenshell.api.remove_pre_listener(usecase_path: str, name: str, callback: Callable[[str, ifcopenshell.file, dict], None]) → None
Remove a pre listener

Parameters:
usecase_path – string, ifcopenshell api use case path

name – string, name of listener

callback – callback function with 3 arguments: usecase_path, ifc_file, settings

ifcopenshell.api.renamed_arguments_deprecation(usecase_path: str, settings: dict, arguments_remapped: dict[str, str]) → tuple[str, dict]
ifcopenshell.api.run(usecase_path: str, ifc_file: ifcopenshell.file | None = None, should_run_listeners: bool = True, \*\*settings: Any) → Any
ifcopenshell.api.serialise_settings(settings)
ifcopenshell.api.wrap_usecase(usecase_path, usecase)
Wraps an API function in pre/post listeners.

ifcopenshell.api.wrap_usecases(path, name)
This developer feature wraps an API module’s usecases with listeners.

ifcopenshell.api.ARGUMENTS_DEPRECATION: dict[str, Callable[[str, dict[str, Any]], tuple[str, dict[str, Any]]]]
ifcopenshell.api.CACHED_USECASES: dict[str, Callable]
ifcopenshell.api.CACHED_USECASE_CLASSES: dict[str, Callable]
ifcopenshell.api.post_listeners: dict[str, dict]
ifcopenshell.api.pre_listeners: dict[str, dict]

ifcopenshell.api.aggregate
Aggregates is the concept of breaking down larger wholes into smaller parts.

For example, spatial elements such as sites are broken down into one or more buildings, and a building is broken down into storeys. Another example is for physical elements, such as how a wall is made out of members and coverings.

Submodules
ifcopenshell.api.aggregate.assign_object
ifcopenshell.api.aggregate.unassign_object
Package Contents
ifcopenshell.api.aggregate.assign_object(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], relating_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Assigns object as an aggregate to the products

All physical IFC model elements must be part of a hierarchical tree called the “spatial decomposition”, where large things are made up of smaller things. This tree always begins at an “IfcProject” and is then broken down using “decomposition” relationships, of which aggregation is the first relationship you will use.

Typically used when you want to describe how large spaces are made up of smaller spaces. For example large spatial elements (e.g. sites, buidings) can be made out of smaller spatial elements (e.g. storeys, spaces).

The largest space (typically the IfcSite) can then be aggregated in a project. It is requirement for all spatial structures to be directly or indirectly aggregated back to the IfcProject to create a hierarchy of spaces.

The other common usecase is when larger physical products are made up of smaller physical products. For example, a stair might be made out of a flight, a landing, a railing and so on. Or a wall might be made out of stud members, and coverings.

As a product may only have a single location in the “spatial decomposition” tree, assigning an aggregate relationship will remove any previous aggregation, containment, or nesting relationships it may have.

IFC placements follow a convention where the placement is relative to its parent in the spatial hierarchy. If your product has a placement, its placement will be recalculated to follow this convention.

Parameters:
products – The list of parts of the aggregate, typically of IfcElement or IfcSpatialStructureElement subclass

relating_object (ifcopenshell.entity_instance) – The whole of the aggregate, typically an IfcElement or IfcSpatialStructureElement subclass

Returns:
The IfcRelAggregate relationship instance or None if products was empty list.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")
element = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite")
subelement = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")

# The project contains a site (note that project aggregation is a special case in IFC)

ifcopenshell.api.aggregate.assign_object(model, products=[element], relating_object=project)

# The site has a building

ifcopenshell.api.aggregate.assign_object(model, products=[subelement], relating_object=element)
ifcopenshell.api.aggregate.unassign_object(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance]) → None
Unassigns products from their aggregate

A product (i.e. a smaller part of a whole) may be aggregated into zero or one larger space or element. This function will remove that aggregation relationship.

As all physical IFC model elements must be part of a hierarchical tree called the “spatial decomposition”, using this function will remove the product from that tree. This is a dangerous operation and may result in the product no longer being visible in IFC applications.

If the product is not part of an aggregation relationship, nothing will happen.

Parameters:
products – The list of parts of the aggregate, typically of IfcElements or IfcSpatialStructureElement subclass

Returns:
None

Return type:
None

Example:

element = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite")
subelement1 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")
subelement2 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")
ifcopenshell.api.aggregate.assign_object(model, products=[subelement1], relating_object=element)
ifcopenshell.api.aggregate.assign_object(model, products=[subelement2], relating_object=element)

# nothing is returned

ifcopenshell.api.aggregate.unassign_object(model, products=[subelement1])

# nothing is returned, relationship is removed

ifcopenshell.api.aggregate.unassign_object(model, products=[subelement2])

ifcopenshell.api.aggregate.assign_object
Module Contents
ifcopenshell.api.aggregate.assign_object.assign_object(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], relating_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Assigns object as an aggregate to the products

All physical IFC model elements must be part of a hierarchical tree called the “spatial decomposition”, where large things are made up of smaller things. This tree always begins at an “IfcProject” and is then broken down using “decomposition” relationships, of which aggregation is the first relationship you will use.

Typically used when you want to describe how large spaces are made up of smaller spaces. For example large spatial elements (e.g. sites, buidings) can be made out of smaller spatial elements (e.g. storeys, spaces).

The largest space (typically the IfcSite) can then be aggregated in a project. It is requirement for all spatial structures to be directly or indirectly aggregated back to the IfcProject to create a hierarchy of spaces.

The other common usecase is when larger physical products are made up of smaller physical products. For example, a stair might be made out of a flight, a landing, a railing and so on. Or a wall might be made out of stud members, and coverings.

As a product may only have a single location in the “spatial decomposition” tree, assigning an aggregate relationship will remove any previous aggregation, containment, or nesting relationships it may have.

IFC placements follow a convention where the placement is relative to its parent in the spatial hierarchy. If your product has a placement, its placement will be recalculated to follow this convention.

Parameters:
products – The list of parts of the aggregate, typically of IfcElement or IfcSpatialStructureElement subclass

relating_object (ifcopenshell.entity_instance) – The whole of the aggregate, typically an IfcElement or IfcSpatialStructureElement subclass

Returns:
The IfcRelAggregate relationship instance or None if products was empty list.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")
element = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite")
subelement = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")

# The project contains a site (note that project aggregation is a special case in IFC)

ifcopenshell.api.aggregate.assign_object(model, products=[element], relating_object=project)

# The site has a building

ifcopenshell.api.aggregate.assign_object(model, products=[subelement], relating_object=element)

ifcopenshell.api.aggregate.unassign_object
Module Contents
ifcopenshell.api.aggregate.unassign_object.unassign_object(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance]) → None
Unassigns products from their aggregate

A product (i.e. a smaller part of a whole) may be aggregated into zero or one larger space or element. This function will remove that aggregation relationship.

As all physical IFC model elements must be part of a hierarchical tree called the “spatial decomposition”, using this function will remove the product from that tree. This is a dangerous operation and may result in the product no longer being visible in IFC applications.

If the product is not part of an aggregation relationship, nothing will happen.

Parameters:
products – The list of parts of the aggregate, typically of IfcElements or IfcSpatialStructureElement subclass

Returns:
None

Return type:
None

Example:

element = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite")
subelement1 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")
subelement2 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")
ifcopenshell.api.aggregate.assign_object(model, products=[subelement1], relating_object=element)
ifcopenshell.api.aggregate.assign_object(model, products=[subelement2], relating_object=element)

# nothing is returned

ifcopenshell.api.aggregate.unassign_object(model, products=[subelement1])

# nothing is returned, relationship is removed

ifcopenshell.api.aggregate.unassign_object(model, products=[subelement2])

ifcopenshell.api.attribute.edit_attributes
Module Contents
ifcopenshell.api.attribute.edit_attributes.edit_attributes(file: ifcopenshell.file, product: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edit the attributes of a product

All IFC entities have attributes. Normally they can be edited directly, by simply assigning a new value to them. In some scenarios, you may wish to also ensure that ownership history is updated. This function provides that convenience.

Parameters:
product (ifcopenshell.entity_instance) – The product you want to edit. This may be any rooted IFC entity.

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

element = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
ifcopenshell.api.attribute.edit_attributes(model,
product=element, attributes={"Name": "Waldo"})

ifcopenshell.api.boundary.assign_connection_geometry
Module Contents
class ifcopenshell.api.boundary.assign_connection_geometry.Usecase
close_polyline(points)
create_plane(location, axis, ref_direction)
create_point(point)
create_polyline(points)
execute()
ifcopenshell.api.boundary.assign_connection_geometry.assign_connection_geometry(file: ifcopenshell.file, rel_space_boundary: ifcopenshell.entity_instance, outer_boundary: list[tuple[float, float]], location: tuple[float, float, float], axis: tuple[float, float, float], ref_direction: tuple[float, float, float], inner_boundaries: list[list[tuple[float, float]]] | None = None, unit_scale: float | None = None) → None
Create and assign a connection geometry to a space boundary relationship

A space boundary may optionally have a plane that represents how that space is adjacent to another space, known as the connection geometry. You may specify this plane in terms of an outer boundary polyline, zero or more inner boundaries (such as for windows), and a positional matrix for the orientation of the plane.

Parameters:
rel_space_boundary (ifcopenshell.entity_instance) – The space boundary relationship to assign the connection geometry to.

outer_boundary (list[tuple[float, float]]) – A list of 2D points representing an open polyline. The last point will connect to the first point. Each point is represented by an interable of 2 floats. The coordinates of the points are relative to the positional matrix arguments.

inner_boundaries (list[list[tuple[float, float]]], optional) – A list of zero or more inner boundaries to use for the plane. Each boundary is represented by an open polyline, as defined by the outer_boundary argument.

location (tuple[float, float, float]) – The local origin of the connection geometry, defined as an XYZ coordinate relative to the placement of the space that is being bounded.

axis (tuple[float, float, float]) – The local X axis of the connection geometry, defined as an XYZ vector relative to the placement of the space that is being bounded.

ref_direction (tuple[float, float, float]) – The local Z axis of the connection geometry, defined as an XYZ vector relative to the placement of the space that is being bounded. The Y vector is automatically derived using the right hand rule.

unit_scale (float, optional) – The unit scale as calculated by ifcopenshell.util.unit.calculate_unit_scale. If not provided, it will be automatically calculated for you.

Returns:
None

Return type:
None

Example:

ifcopenshell.api.boundary.assign_connection_geometry(model,
rel_space_boundary=element,
outer_boundary=[(0., 0.), (1., 0.), (1., 1.), (0., 1.)],
location=[0., 0., 0.], axis=[1., 0., 0.], ref_direction=[0., 0., 1.],
)

ifcopenshell.api.boundary.copy_boundary
Module Contents
ifcopenshell.api.boundary.copy_boundary.copy_boundary(file: ifcopenshell.file, boundary: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Copies a space boundary

Parameters:
boundary (ifcopenshell.entity_instance) – The IfcRelSpaceBoundary you want to copy.

Returns:
Duplicate of the IfcRelSpaceBoundary

Return type:
ifcopenshell.entity_instance

Example:

# A boring boundary with no geometry. Note that this boundary is # invalid and does not relate to any space or building element. boundary = ifcopenshell.api.root.create_entity(model, ifc_class=”IfcRelSpaceBoundary”)

# And now we have two boundary_copy = ifcopenshell.api.boundary.copy_boundary(model, boundary=boundary)

ifcopenshell.api.boundary.edit_attributes
Module Contents
ifcopenshell.api.boundary.edit_attributes.edit_attributes(file: ifcopenshell.file, entity: ifcopenshell.entity_instance, relating_space: ifcopenshell.entity_instance, related_building_element: ifcopenshell.entity_instance, parent_boundary: ifcopenshell.entity_instance | None = None, corresponding_boundary: ifcopenshell.entity_instance | None = None) → None
Modify the relationships of a space boundary relationship

Currently this function is quite minimal and offers no advantage to manual assignment of the space boundary attributes.

Parameters:
entity (ifcopenshell.entity_instance) – The IfcRelSpaceBoundary to modify

relating_space (ifcopenshell.entity_instance) – The IfcSpace or IfcExternalSpatialElement that the space boundary is related to.

related_building_element – The IfcElement that defines the boundary, typically an IfcWall.

parent_boundary (ifcopenshell.entity_instance, optional) – A parent IfcRelSpaceBoundary, only provided if this is an inner boundary. This can apply to 1st and 2nd level boundaries.

corresponding_boundary (ifcopenshell.entity_instance, optional) – The other IfcRelSpaceBoundary on the other side of the related element. The pair together represents a thermal boundary. This only applies to 2nd level boundaries.

Returns:
None

Return type:
None

ifcopenshell.api.boundary.remove_boundary
Module Contents
ifcopenshell.api.boundary.remove_boundary.remove_boundary(file: ifcopenshell.file, boundary: ifcopenshell.entity_instance) → None
Removes a space boundary

The relating space or related building element is untouched. Only the boundary and its connection geometry is removed.

Parameters:
boundary (ifcopenshell.entity_instance) – The IfcRelSpaceBoundary you want to remove.

Returns:
None

Return type:
None

Example:

# A boring boundary with no geometry. Note that this boundary is # invalid and does not relate to any space or building element. boundary = ifcopenshell.api.root.create_entity(model, ifc_class=”IfcRelSpaceBoundary”)

# Let’s remove it! ifcopenshell.api.boundary.remove_boundary(model, boundary=boundary)

ifcopenshell.api.classification.add_classification
Module Contents
class ifcopenshell.api.classification.add_classification.Usecase
add_from_library()
execute()
relate_to_project(classification)
ifcopenshell.api.classification.add_classification.add_classification(file: ifcopenshell.file, classification: str | ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Adds a new classification system to the project

External classification systems such as Uniclass or Omniclass are ways of categorising elements in the AEC industry, typically standardised or nominated by governments or companies. A system typically contains a series of hierarchical reference codes and labels like Pr_12_23_34.

Classifications may be applied to many things, not just physical elements, such as doors and windows, spatial elements, tasks, cost items, or even resources.

Prior to assigning classificaion references, you need to add the name and metadata of the classification system that you will use in your project. Classification systems may be revised over time, so this metadata includes the edition date.

Common classification systems are provided as an IFC library which may be downloaded from https://github.com/Moult/IfcClassification for your convenience. It is advised to use these to ensure that the classification metadata is standardised.

Adding a classification system will not add the entire hierarchy of references available in the classification. References need to be added separately. Typically, you’d only add the references that you use in your project, see ifcopenshell.api.classification.add_reference for more information.

Parameters:
classification (str,ifcopenshell.entity_instance) – If a string is provided, it is assumed to be the name of your classification system. This is necessary if you are creating your own custom classification system. Alternatively, you may provide an entity_instance of an IfcClassification from an IFC classification library. The latter approach is preferred if you are using a commonly known system such as Uniclass, as this will ensure all metadata is added correctly.

Returns:
The added IfcClassification element

Return type:
ifcopenshell.entity_instance

Example:

# Option 1: adding a custom clasification from scratch

ifcopenshell.api.classification.add_classification(model,
classification="MyCustomClassification")

# Option 2: adding a popular classification from a library

library = ifcopenshell.open("/path/to/Uniclass.ifc")
classification = library.by_type("IfcClassification")[0]
ifcopenshell.api.classification.add_classification(model,
classification=classification)

ifcopenshell.api.classification.add_reference
Module Contents
class ifcopenshell.api.classification.add_reference.Usecase
add_from_identification()
add_from_library() → ifcopenshell.entity_instance
execute()
get_existing_reference(identification: str | None = None) → ifcopenshell.entity_instance | None
update_relationships(reference: ifcopenshell.entity_instance) → None
ifcopenshell.api.classification.add_reference.add_reference(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], reference: ifcopenshell.entity_instance | None = None, identification: str | None = None, name: str | None = None, classification: ifcopenshell.entity_instance | None = None, is_lightweight=True) → ifcopenshell.entity_instance | None
Adds a new classification reference and assigns it to the list of products

A classification reference is a single entry such as “Pr_12_23_34” that is part of an external classification system (such as Uniclass or Omniclass).

References can be added to almost any object in IFC, including physical objects, object types, properties, tasks, costs, resources, or even resources such as profiles, documents, libraries, and so on.

Classification references can be added in two ways. Option 1) specify a custom arbitrary reference, where you have to manually specify the identification (e.g. “Pr_12_23_45”) and name (e.g. “Door Products”). Option 2) add a reference from an IFC classification library. The latter is preferred if you are using a common classification system such as Uniclass, as the library will be prepopulated with all the valid classifications already.

Objects are allowed to have multiple classification references from multiple classification systems. This means that adding a new reference will not remove existing references.

References can be inherited from types. This means that if an IfcWallType has a classification reference of Pr_12_23_34, then all IfcWall occurrences of that type automatically get the same classification of Pr_12_23_34. This means that it is more efficient to assign to types where possible. If a classification reference is assigned to both the type and an occurrence, then the assignment at the occurrence will override the type classification.

Parameters:
product (list[ifcopenshell.entity_instance]) – The list of IFC objects, properties, or resources you want to associate the classification reference to.

reference (ifcopenshell.entity_instance, optional) – The classification reference entity taken from an IFC classification library. If you supply this parameter, you will use option 2.

identification (str, optional) – If you choose option 1 and do not specify a reference, you may manually specify an identification code. The code is typically a short identifier and may have punctuation to separate the levels of hierarchy in the classificaion (e.g. Pr_12_23_34).

name (str, optional) – If you choose option 1 and do not specify a reference, you may manually specify a name. The name is typically human readable.

classification (ifcopenshell.entity_instance) – The IfcClassification entity in your IFC model (not the library, if you are doing option 2) that the reference is part of.

is_lightweight (bool, optional) – If you are doing option 2, choose whether or not to only add that particular reference (lighweight) or also add all of its parent references in the classification hierarchy (not lighweight). For example, adding a lightweight reference to Pr_12_23_34 will only add Pr_12_23_34, but adding a heavy reference to Pr_12_23_34 will also add Pr_12_23 and Pr_12. These parent references merely help describe the “tree” of classifications, but is generally unnecessary. Using lightweight classifications are recommended and is the default.

Raises:
TypeError – If file is IFC2X3 and products has non-IfcRoot elements.

Returns:
The newly added IfcClassificationReference or None if products was empty list.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

# Option 1: adding and assigning a new reference from scratch

wall_type = model.by_type("IfcWallType")[0]
classification = ifcopenshell.api.classification.add_classification(
model, classification="MyCustomClassification")
ifcopenshell.api.classification.add_reference(model,
products=[wall_type], classification=classification,
identification="W_01", name="Interior Walls")

# Option 2: adding a popular classification from a library

library = ifcopenshell.open("/path/to/Uniclass.ifc")
lib_classification = library.by_type("IfcClassification")[0]
classification = ifcopenshell.api.classification.add_classification(
model, classification=lib_classification)
reference = [r for r in library.by_type("IfcClassificationReference")
if r.Identification == "XYZ"][0]
ifcopenshell.api.classification.add_reference(model,
products=[wall_type], classification=classification,
reference=reference)

ifcopenshell.api.classification.edit_classification
Module Contents
ifcopenshell.api.classification.edit_classification.edit_classification(file: ifcopenshell.file, classification: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcClassification

For more information about the attributes and data types of an IfcClassification, consult the IFC documentation.

Parameters:
classification (ifcopenshell.entity_instance) – The IfcClassification entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

classification = model.by_type("IfcClassification")[0]

# Change the name of the classification system to "Foo"

ifcopenshell.api.classification.edit_classification(model,
classification=classification, attributes={"Name": "Foo"})

ifcopenshell.api.classification.edit_reference
Module Contents
ifcopenshell.api.classification.edit_reference.edit_reference(file: ifcopenshell.file, reference: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcClassificationReference

For more information about the attributes and data types of an IfcClassificationReference, consult the IFC documentation.

Parameters:
reference (ifcopenshell.entity_instance) – The IfcClassificationReference entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

reference = model.by_type("IfcClassification")[0]

# Change the name of the reference to "Foo"

ifcopenshell.api.classification.edit_reference(model,
reference=reference, attributes={"Name": "Foo"})

ifcopenshell.api.classification.remove_classification
Module Contents
class ifcopenshell.api.classification.remove_classification.Usecase
execute()
get_references(classification: ifcopenshell.entity_instance) → list[ifcopenshell.entity_instance]
ifcopenshell.api.classification.remove_classification.remove_classification(file: ifcopenshell.file, classification: ifcopenshell.entity_instance) → None
Removes an IfcClassification from the project and all references

The classification and all of its relationships, children references, and relationships between objects and child references are completely removed from a project.

Parameters:
classification (ifcopenshell.entity_instance) – The IfcClassification entity you want to remove

Returns:
None

Return type:
None

Example:

classification = model.by_type("IfcClassification")[0]
ifcopenshell.api.classification.remove_classification(model,
classification=classification)

ifcopenshell.api.classification.remove_reference
Module Contents
ifcopenshell.api.classification.remove_reference.remove_reference(file: ifcopenshell.file, reference: ifcopenshell.entity_instance, products: list[ifcopenshell.entity_instance]) → None
Removes a classification reference from the list of products

If the classification reference is no longer associated to any products, the classification reference itself is also removed.

Parameters:
reference (ifcopenshell.entity_instance) – The IfcClassificationReference entity of the relationship you want to remove.

product (list[ifcopenshell.entity_instance]) – The list fo object entities of the relationship you want to remove.

Raises:
TypeError – If file is IFC2X3 and products has non-IfcRoot elements.

Returns:
None

Return type:
None

Example:

wall_type = model.by_type("IfcWallType")[0]
classification = ifcopenshell.api.classification.add_classification(
model, classification="MyCustomClassification")
reference = ifcopenshell.api.classification.add_reference(model,
products=[wall_type], classification=classification,
identification="W_01", name="Interior Walls")
ifcopenshell.api.classification.remove_reference(model,
reference=reference, products=[wall_type])

    ifcopenshell.api.constraint.add_metric

Module Contents
ifcopenshell.api.constraint.add_metric.add_metric(file: ifcopenshell.file, objective: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Add a new metric benchmark

Qualitative constraints may have a series of quantitative benchmarks linked to it known as metrics. Metrics may be parametrically linked to computed model properties or quantities. Metrics need to be satisfied to meet the objective of the constraint.

Parameters:
objective (ifcopenshell.entity_instance) – The IfcObjective that this metric is a benchmark of.

Returns:
The newly created IfcMetric entity

Return type:
ifcopenshell.entity_instance

Example:

objective = ifcopenshell.api.constraint.add_objective(model)
metric = ifcopenshell.api.constraint.add_metric(model,
objective=objective)

    ifcopenshell.api.constraint.add_metric_reference

Module Contents
ifcopenshell.api.constraint.add_metric_reference.add_metric_reference(file: ifcopenshell.file, metric: ifcopenshell.entity_instance, reference_path: str) → list[ifcopenshell.entity_instance]
Adds a chain of references to a metric. The reference path is a string of the form “attribute.attribute.attribute” Used to reference a value of an attribute of an instance through a metric objective entity.

ifcopenshell.api.constraint.add_objective
Module Contents
ifcopenshell.api.constraint.add_objective.add_objective(file: ifcopenshell.file) → ifcopenshell.entity_instance
Add a new objective constraint

Parametric constraints may be defined by the user. The constraint is defined by first creating an objective describing the purpose of the constraint and whether it is a hard or soft constraint. Later on, metrics may be added to check whether the constraint has been met by connecting it to properties and quantities. See ifcopenshell.api.constraint.add_metric for more information.

Returns:
The newly created IfcObjective entity

Return type:
ifcopenshell.entity_instance

Example:

# Create a new objective for code compliance requirements

objective = ifcopenshell.api.constraint.add_objective(model)
objective.ConstraintGrade = "ADVISORY"
objective.ObjectiveQualifier = "CODECOMPLIANCE"

# Note: the objective right now is purely qualitative and for

# information purposes. You may wish to add quantiative metrics.

ifcopenshell.api.constraint.assign_constraint
Module Contents
class ifcopenshell.api.constraint.assign_constraint.Usecase
execute()
get_constraint_rels() → list[ifcopenshell.entity_instance]
ifcopenshell.api.constraint.assign_constraint.assign_constraint(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], constraint: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Assigns a constraint to a list of products

This assigns a relationship between a product and a constraint, so that when a product’s properties and quantities do not match the requirements of the constraint’s metrics, results can be flagged.

It is assumed (but not explicit in the IFC documentation) that constraints are inherited from the type. This way, it is not necessary to create lots of constraint assignments.

Parameters:
products (list[ifcopenshell.entity_instance]) – The list of products the constraint applies to. This is anything which can have properties or quantities.

constraint (ifcopenshell.entity_instance) – The IfcObjective constraint

Returns:
The new or updated IfcRelAssociatesConstraint relationship or None if products was an empty list.

Return type:
ifcopenshell.entity_instance

ifcopenshell.api.constraint.edit_metric
Module Contents
ifcopenshell.api.constraint.edit_metric.edit_metric(file: ifcopenshell.file, metric: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edit the attributes of a metric

For more information about the attributes and data types of an IfcMetric, consult the IFC documentation.

Parameters:
metric (ifcopenshell.entity_instance) – The IfcMetric you want to edit.

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

objective = ifcopenshell.api.constraint.add_objective(model)
metric = ifcopenshell.api.constraint.add_metric(model,
objective=objective)
ifcopenshell.api.constraint.edit_metric(model,
metric=metric, attributes={"ConstraintGrade": "HARD"})

    ifcopenshell.api.constraint.edit_objective

Module Contents
ifcopenshell.api.constraint.edit_objective.edit_objective(file: ifcopenshell.file, objective: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edit the attributes of a objective

For more information about the attributes and data types of an IfcObjective, consult the IFC documentation.

Parameters:
objective (ifcopenshell.entity_instance) – The IfcObjective you want to edit.

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

objective = ifcopenshell.api.constraint.add_objective(model)
ifcopenshell.api.constraint.edit_objective(model,
objective=objective, attributes={"ConstraintGrade": "HARD"})

    ifcopenshell.api.constraint.remove_constraint

Module Contents
ifcopenshell.api.constraint.remove_constraint.remove_constraint(file: ifcopenshell.file, constraint: ifcopenshell.entity_instance) → None
Remove a constraint (typically an objective)

Removes a constraint definition and all of its associations to any products. Typically this would be an IfcObjective, although technically you can associate IfcMetrics ith products too, though the meaning may be unclear.

Parameters:
constraint (ifcopenshell.entity_instance) – The IfcObjective you want to remove.

Returns:
None

Return type:
None

Example:

objective = ifcopenshell.api.constraint.add_objective(model)
ifcopenshell.api.constraint.remove_constraint(model,
constraint=objective)

    ifcopenshell.api.constraint.remove_metric

Module Contents
class ifcopenshell.api.constraint.remove_metric.Usecase
delete_reference(reference)
execute()
ifcopenshell.api.constraint.remove_metric.remove_metric(file: ifcopenshell.file, metric: ifcopenshell.entity_instance) → None
Remove a metric benchmark

Removes a metric benchmark and all of its associations to any products and objectives.

Parameters:
metric (ifcopenshell.entity_instance) – The IfcMetric you want to remove.

Returns:
None

Return type:
None

Example:

objective = ifcopenshell.api.constraint.add_objective(model)
metric = ifcopenshell.api.constraint.add_metric(model,
objective=objective)
ifcopenshell.api.constraint.remove_metric(model,
metric=metric)

    ifcopenshell.api.constraint.unassign_constraint

Module Contents
class ifcopenshell.api.constraint.unassign_constraint.Usecase
execute()
get_constraint_rels() → list[ifcopenshell.entity_instance]
ifcopenshell.api.constraint.unassign_constraint.unassign_constraint(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], constraint: ifcopenshell.entity_instance) → None
Unassigns a constraint from a list of products

The constraint will not be deleted and is available to be assigned to other products.

Parameters:
products (list[ifcopenshell.entity_instance]) – The list of products the constraint applies to.

constraint (ifcopenshell.entity_instance) – The IfcObjective constraint

Returns:
None

Return type:
None

ifcopenshell.api.context.add_context
Module Contents
class ifcopenshell.api.context.add_context.Usecase
create_2d_origin()
create_3d_origin()
execute()
ifcopenshell.api.context.add_context.add_context(file: ifcopenshell.file, context_type: ifcopenshell.util.representation.CONTEXT_TYPE | None = None, context_identifier: ifcopenshell.util.representation.REPRESENTATION_IDENTIFIER | None = None, target_view: ifcopenshell.util.representation.TARGET_VIEW | None = None, parent: ifcopenshell.entity_instance | None = None) → ifcopenshell.entity_instance
Adds a new geometric representation context

In IFC, physical objects may have zero, one, or multiple geometric representations associated with it. For example, a building storey might not have any geometry, but simply be a coordinate in space. Alternatively, a wall might have a 3D body representation in the form of a cuboid. As a final example, a door might also have a 3D body representation of a 3D door panel and door frame, but may additionally have a 2D door plan view representation of the door swing, and even a 2D elevation view of the door, a 3D box representing the disabled clearance zone of the door, a 2D profile representing the profile of the door to cut out in a wall, and so on. In this situation, a door will have multiple geometric representations.

To distinguish between the different purposes of multiple geometric representations, each geometric representation must belong to a geometric representation “context”. There are typically always 2 contexts, one for 3D representations and one for 2D representations. These 2 contexts then have subcontexts for things like the 3D body representation, clearance representations, annotation representations, and so on. Each representation of a physical IFC product (e.g. a door) must be assigned to one of these subcontexts. Therefore setting up appropriate contexts is critical prior to authoring any IFC model which contains geometry.

There are two steps to setting up appropriate subcontexts. First, a 2D and/or 3D context must be added. These must be always called the “Model” context for 3D and the “Plan” context for 2D (even if the 2D geometry is not a plan view). Then, one or more subcontexts are added using either the “Model” or “Plan” as their parent. These subcontexts are further distinguished using an “identifier” and “target view”. The “identifier” describes the purpose of the representation, and the “target view” describes the typical diagrammatic presentation that context’s geometry should be viewed in. The most common identifiers you might use are:

Body: for the actual shape of the object

Box: the bounding box of the object (useful for shape analytics)

Axis: the parametric line determining the shape of the object

Profile: the elevation silhouette of the object, useful for cutting
out holes for the object to fit into host elements

Footprint: the plan view silhouette of the object, useful for certain
quantity take-off rules

Clearance: the clearance zone of the object

Annotation: symbolic annotations typically used in diagrams or
drawings

The most common “target views” you might use are:

MODEL_VIEW: for 3D geometry you might see in a BIM viewer

PLAN_VIEW: for 2D geometry you might see in a plan representation

ELEVATION_VIEW: for 2D geometry you might see in an elevation representation

SECTION_VIEW: for 2D geometry you might see in a section representation

GRAPH_VIEW: for 2D or 3D line or frame or path connectivity diagrams
you might use for structural frame analysis, axis-based parametric modeling

SKETCH_VIEW: for viewing abstract high-level representations such as
in bubble diagrams of spatial topology

This may sound like a lot, but after a few typical contexts are set up at the beginning, it becomes easy to navigate and isolate geometry for different purposes. There is also the concept of a target scale, which represents the zoom level detail of geometry, but this is not currently supported by this API. Setting up all these contexts are also optional, and you may only use a single Model context and Body subcontext for simple models, but this simplification sacrifices the ability of more parametric or analytical usecases.

Parameters:
context_type (str, optional) – The type of the context, must be one of “Model” or “Plan” only.

context_identifier (str, optional) – The identifier of the context, chosen from one of the common identifiers above or consult the IFC documentation (under the IfcShapeRepresentation page) for more details. Optional for contexts, but mandatory for subcontexts.

target_view – the target view of the context, chosen from one of the common target views above or consult the IFC documentation (under the IfcShapeRepresentation page) for more details. Optional for contexts, but mandatory for subcontexts.

parent (ifcopenshell.entity_instance, optional) – the parent context. Must be left as None (the default) for contexts, and only set for subcontexts. Note that there are only contexts and subcontexts, a subcontext cannot have any children.

Returns:
the newly created IfcGeometricRepresentationContext or IfcGeometricRepresentationSubContext entity

Return type:
ifcopenshell.entity_instance

Example:

# If we plan to store 3D geometry in our IFC model, we have to setup

# a "Model" context.

model3d = ifcopenshell.api.context.add_context(model, context_type="Model")

# And/Or, if we plan to store 2D geometry, we need a "Plan" context

plan = ifcopenshell.api.context.add_context(model, context_type="Plan")

# Now we setup the subcontexts with each of the geometric "purposes"

# we plan to store in our model. "Body" is by far the most important

# and common context, as most IFC models are assumed to be viewable

# in 3D.

body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

# The 3D Axis subcontext is important if any "axis-based" parametric

# geometry is going to be created. For example, a beam, or column

# may be drawn using a single 3D axis line, and for this we need an

# Axis subcontext.

ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Axis", target_view="GRAPH_VIEW", parent=model3d)

# The 3D Box subcontext is useful for clash detection or shape

# analysis, or even lazy-loading of large models.

ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Box", target_view="MODEL_VIEW", parent=model3d)

# It's also important to have a 2D Axis subcontext for things like

# walls and claddings which can be drawn using a 2D axis line.

ifcopenshell.api.context.add_context(model,
context_type="Plan", context_identifier="Axis", target_view="GRAPH_VIEW", parent=plan)

# A 2D annotation subcontext for plan views are important for door

# swings, window cuts, and symbols for equipment like GPOs, fire

# extinguishers, and so on.

ifcopenshell.api.context.add_context(model,
context_type="Plan", context_identifier="Annotation", target_view="PLAN_VIEW", parent=plan)

# You may also create 2D annotation subcontexts for sections and

# elevation views.

ifcopenshell.api.context.add_context(model,
context_type="Plan", context_identifier="Annotation", target_view="SECTION_VIEW", parent=plan)
ifcopenshell.api.context.add_context(model,
context_type="Plan", context_identifier="Annotation", target_view="ELEVATION_VIEW", parent=plan)

# Let's create a new wall. The wall does not have any geometry yet.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Let's use the "3D Body" representation we created earlier to add a

# new wall-like body geometry, 5 meters long, 3 meters high, and

# 200mm thick

representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=5, height=3, thickness=0.2)

# Assign our new body geometry back to our wall

ifcopenshell.api.geometry.assign_representation(model,
product=wall, representation=representation)

# Place our wall at the origin

ifcopenshell.api.geometry.edit_object_placement(model, product=wall)

ifcopenshell.api.context.edit_context
Module Contents
ifcopenshell.api.context.edit_context.edit_context(file: ifcopenshell.file, context: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcGeometricRepresentationContext

For more information about the attributes and data types of an IfcGeometricRepresentationContext, consult the IFC documentation.

Parameters:
context (ifcopenshell.entity_instance) – The IfcGeometricRepresentationContext entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

model = ifcopenshell.api.context.add_context(model, context_type="Model")

# Revit had a bug where they incorrectly called the body representation a "Facetation"

body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Facetation", target_view="MODEL_VIEW", parent=model
)

# Let's fix it!

ifcopenshell.api.context.edit_context(model,
context=body, attributes={"ContextIdentifier": "Body"})

    ifcopenshell.api.context.remove_context

Module Contents
ifcopenshell.api.context.remove_context.remove_context(file: ifcopenshell.file, context: ifcopenshell.entity_instance) → None
Removes an IfcGeometricRepresentationContext

Any representation geometry that is assigned to the context is also removed. If a context is removed, then any subcontexts are also removed.

Parameters:
context (ifcopenshell.entity_instance) – The IfcGeometricRepresentationContext entity to remove

Returns:
None

Return type:
None

Example:

model = ifcopenshell.api.context.add_context(model, context_type="Model")

# Revit had a bug where they incorrectly called the body representation a "Facetation"

body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Facetation", target_view="MODEL_VIEW", parent=model
)

# Let's just get rid of it completely

ifcopenshell.api.context.remove_context(model, context=body)

ifcopenshell.api.control
Processes and costs may be controlled by other entities which indicate constraints that determine how they can change

This is an advanced feature mostly used in 4D/5D

Submodules
ifcopenshell.api.control.assign_control
ifcopenshell.api.control.unassign_control
Package Contents
ifcopenshell.api.control.assign_control(file: ifcopenshell.file, relating_control: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Assigns a planning control or constraint to an object

IFC can describe concepts that control other objects. For example, a planning calendar controls the availability of working days for construction planning. As another example, a cost item might constrain or limit the ability to procure and build a product.

This usecase lets you assign controls following the rules of the IFC specification. This is an advanced topic and assumes knowledge of the IFC concepts to determine what is allowed to control what. In the future, this API will likely be deprecated in favour of multiple usecase specific APIs.

Parameters:
relating_control (ifcopenshell.entity_instance) – The IfcControl entity that is creating the control or constraint

related_object (ifcopenshell.entity_instance) – The IfcObjectDefinition that is being controlled

Returns:
The newly created IfcRelAssignsToControl. If relationship already existed before and wasn’t changed then returns None.

Return type:
ifcopenshell.entity_instance, None

Example:

# One common usecase is to assign a calendar to a task

calendar = ifcopenshell.api.sequence.add_work_calendar(model)
schedule = ifcopenshell.api.sequence.add_work_schedule(model)
task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule)

# All subtasks will inherit this calendar, so assigning a single

# calendar to the root task effectively defines a "default" calendar

ifcopenshell.api.control.assign_control(model,
relating_control=calendar, related_object=task)

# Another common example might be relating a cost item and a product

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
schedule = ifcopenshell.api.cost.add_cost_schedule(model)
cost_item = ifcopenshell.api.cost.add_cost_item(model,
cost_schedule=schedule)
ifcopenshell.api.control.assign_control(model,
relating_control=cost_item, related_object=wall)
ifcopenshell.api.control.unassign_control(file: ifcopenshell.file, relating_control: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Unassigns a planning control or constraint to an object

Parameters:
relating_control (ifcopenshell.entity_instance) – The IfcControl entity that is creating the control or constraint

related_object (ifcopenshell.entity_instance) – The IfcObjectDefinition that is being controlled

Returns:
If the control still is related to other objects, the IfcRelAssignsToControl is returned, otherwise None.

Return type:
ifcopenshell.entity_instance, None

Example:

# Let's relate a cost item and a product

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
schedule = ifcopenshell.api.cost.add_cost_schedule(model)
cost_item = ifcopenshell.api.cost.add_cost_item(model,
cost_schedule=schedule)
ifcopenshell.api.control.assign_control(model,
relating_control=cost_item, related_object=wall)

# And now let's change our mind

ifcopenshell.api.control.unassign_control(model,
relating_control=cost_item, related_object=wall)

    ifcopenshell.api.control.assign_control

Module Contents
ifcopenshell.api.control.assign_control.assign_control(file: ifcopenshell.file, relating_control: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Assigns a planning control or constraint to an object

IFC can describe concepts that control other objects. For example, a planning calendar controls the availability of working days for construction planning. As another example, a cost item might constrain or limit the ability to procure and build a product.

This usecase lets you assign controls following the rules of the IFC specification. This is an advanced topic and assumes knowledge of the IFC concepts to determine what is allowed to control what. In the future, this API will likely be deprecated in favour of multiple usecase specific APIs.

Parameters:
relating_control (ifcopenshell.entity_instance) – The IfcControl entity that is creating the control or constraint

related_object (ifcopenshell.entity_instance) – The IfcObjectDefinition that is being controlled

Returns:
The newly created IfcRelAssignsToControl. If relationship already existed before and wasn’t changed then returns None.

Return type:
ifcopenshell.entity_instance, None

Example:

# One common usecase is to assign a calendar to a task

calendar = ifcopenshell.api.sequence.add_work_calendar(model)
schedule = ifcopenshell.api.sequence.add_work_schedule(model)
task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule)

# All subtasks will inherit this calendar, so assigning a single

# calendar to the root task effectively defines a "default" calendar

ifcopenshell.api.control.assign_control(model,
relating_control=calendar, related_object=task)

# Another common example might be relating a cost item and a product

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
schedule = ifcopenshell.api.cost.add_cost_schedule(model)
cost_item = ifcopenshell.api.cost.add_cost_item(model,
cost_schedule=schedule)
ifcopenshell.api.control.assign_control(model,
relating_control=cost_item, related_object=wall)

    ifcopenshell.api.control.unassign_control

Module Contents
ifcopenshell.api.control.unassign_control.unassign_control(file: ifcopenshell.file, relating_control: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Unassigns a planning control or constraint to an object

Parameters:
relating_control (ifcopenshell.entity_instance) – The IfcControl entity that is creating the control or constraint

related_object (ifcopenshell.entity_instance) – The IfcObjectDefinition that is being controlled

Returns:
If the control still is related to other objects, the IfcRelAssignsToControl is returned, otherwise None.

Return type:
ifcopenshell.entity_instance, None

Example:

# Let's relate a cost item and a product

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
schedule = ifcopenshell.api.cost.add_cost_schedule(model)
cost_item = ifcopenshell.api.cost.add_cost_item(model,
cost_schedule=schedule)
ifcopenshell.api.control.assign_control(model,
relating_control=cost_item, related_object=wall)

# And now let's change our mind

ifcopenshell.api.control.unassign_control(model,
relating_control=cost_item, related_object=wall)

    ifcopenshell.api.cost.add_cost_item

Module Contents
ifcopenshell.api.cost.add_cost_item.add_cost_item(file: ifcopenshell.file, cost_schedule: ifcopenshell.entity_instance | None = None, cost_item: ifcopenshell.entity_instance | None = None) → ifcopenshell.entity_instance
Add a new cost item

A cost item represents a single line item in a cost schedule. Cost items may then be broken down into cost subitems.

Either cost_schedule or cost_item must be provided.

Parameters:
cost_schedule (ifcopenshell.entity_instance, optional.) – If the cost item is to be added as a root or top level cost item to a cost schedule, the IfcCostSchedule may be specified. This is mutually exlclusive to the cost_item parameter.

cost_item (ifcopenshell.entity_instance, optional) – If the cost item is to be added as a subitem to an existing cost item, the parent IfcCostItem may be specified. This is mutually exclusive to the cost_schedule parameter.

Returns:
The newly created IfcCostItem

Return type:
ifcopenshell.entity_instance

Example:

# The very first cost item must be in a cost schedule

schedule = ifcopenshell.api.cost.add_cost_schedule(model)

# You may add cost items as top level item in the schedule

item1 = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)

# Alternatively you may add them as subitems

item2 = ifcopenshell.api.cost.add_cost_item(model, cost_item=item1)

ifcopenshell.api.cost.add_cost_item_quantity
Module Contents
ifcopenshell.api.cost.add_cost_item_quantity.add_cost_item_quantity(file: ifcopenshell.file, cost_item: ifcopenshell.entity_instance, ifc_class: ifcopenshell.util.unit.QUANTITY_CLASS = 'IfcQuantityCount') → ifcopenshell.entity_instance
Adds a new quantity associated with a cost item

Cost items calculate their subtotal by multiplying the sum of the cost item’s “values” by the sum of the cost item’s “quantities”. The quantities may be either parametrically linked to quantities measured on physical product, or manually specified.

The quantity must be of a particular type, common examples are:

IfcQuantityCount: to count the total occurrences of a product, useful for things like doors, windows, and furniture

IfcQuantityNumber: any other generic numeric quantity

IfcQuantityLength

IfcQuantityArea

IfcQuantityVolume

IfcQuantityWeight

IfcQuantityTime

A cost item must not mix quantities of different types.

If an IfcQuantityCount is used, then this API will automatically count all products that this cost item controls (see ifcopenshell.api.controls.assign_control) and prefill that quantity.

For all other quantity types, the quantity is left as zero and the user must either manually specify the quantity or parametrically link it using another API call.

Parameters:
cost_item (ifcopenshell.entity_instance) – The IfcCostItem to add the quantity to

ifc_class (str, optional) – The type of quantity to add

Returns:
The newly created quantity entity, chosen from the ifc_class parameter

Return type:
ifcopenshell.entity_instance

Example:

chair = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")
schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
ifcopenshell.api.control.assign_control(model,
relating_control=item, related_object=chair)

# Let's assume we want to count the amount of chairs to calculate our cost item

# Because this is an IfcQuantityCount the count will be automatically set to "1" chair

ifcopenshell.api.cost.add_cost_item_quantity(model,
cost_item=item, ifc_class="IfcQuantityCount")

ifcopenshell.api.cost.add_cost_schedule
Module Contents
ifcopenshell.api.cost.add_cost_schedule.add_cost_schedule(file: ifcopenshell.file, name: str | None = None, predefined_type: str = 'NOTDEFINED') → ifcopenshell.entity_instance
Add a new cost schedule

A cost schedule is a group of cost items which typically represent a cost plan or breakdown of the project. This may be used as an estimate, bid, or actual cost.

Alternatively, a cost schedule may also represent a schedule of rates, which include cost items which capture unit rates for different elements or processes.

As such, creating a cost schedule is necessary prior to creating and managing any cost items.

Parameters:
name (str, optional) – The name of the cost schedule.

predefined_type (str, optional) – The predefined type of the cost schedule, chosen from a valid type in the IFC documentation for IfcCostScheduleTypeEnum

Returns:
The newly created IfcCostSchedule entity

Return type:
ifcopenshell.entity_instance

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)

# Now that we have a cost schedule, we may add cost items to it

item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
ifcopenshell.api.cost.add_cost_schedule.createIfcDateAndTime(file: ifcopenshell.file, dt: datetime.datetime)

ifcopenshell.api.cost.add_cost_value
Module Contents
ifcopenshell.api.cost.add_cost_value.add_cost_value(file: ifcopenshell.file, parent: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Adds a new value or subvalue to a cost item

A cost item’s subtotal can be specified in two ways.

Option 1 is by simply manually specifying the subtotal value, which represents the full cost of that cost item. This option occurs when a cost item has no quantities associated with it.

Option 2 is by specifying a unit cost value of the cost item, which is then multiplied by the associated quantity of the cost item, to give us the subtotal. This option occurs when a cost item has quantities associated with it.

For either option 1 (full cost value) or option 2 (unit cost value), the cost value may be specified as a single number, or as a sum of subcomponents or formulas (e.g. multiplication by wastage factor, or adding taxes or other adjustments).

This function lets you add a single top level unit value to a cost item, or alternatively price subcomponents by using the “parent” parameter.

More advanced usage, which involves summing, subcategory-filtered costs, and formulas are possible but not yet documented.

Parameters:
parent (ifcopenshell.entity_instance) – A parent IfcCostItem, if specifying a price directly to a cost item, or a top-level price component. Alternatively, this can be set to a IfcCostValue, if specifying price subcomponents.

Returns:
The newly created IfcCostValue

Return type:
ifcopenshell.entity_instance

Example:

# We always need a schedule first prior to adding any cost items

schedule = ifcopenshell.api.cost.add_cost_schedule(model)

# Option 1: This cost item will have a full cost of 42.0

item1 = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
value = ifcopenshell.api.cost.add_cost_value(model, parent=item1)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 42.0})

# Option 2: This cost item will have a unit cost of 5.0 per unit

# area, multiplied by the quantity of area specified explicitly as

# 3.0, giving us a subtotal cost of 15.0.

item2 = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
value = ifcopenshell.api.cost.add_cost_value(model, parent=item2)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 5.0})
quantity = ifcopenshell.api.cost.add_cost_item_quantity(model,
cost_item=item2, ifc_class="IfcQuantityVolume")
ifcopenshell.api.cost.edit_cost_item_quantity(model,
physical_quantity=quantity, "attributes": {"VolumeValue": 3.0})

# A cost value may also be specified in terms of the sum of its

# subcomponents. In this case, it's broken down into 2 subvalues.

item1 = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
value = ifcopenshell.api.cost.add_cost_value(model, parent=item1)
subvalue1 = ifcopenshell.api.cost.add_cost_value(model, parent=value)
subvalue2 = ifcopenshell.api.cost.add_cost_value(model, parent=value)

# This specifies that the value is the sum of all subitems

# regardless of their cost category. The first subvalue is 2.0 and

# the second is 3.0, giving a total value of 5.0.

ifcopenshell.api.cost.edit_cost_value(model, cost_value=value, attributes={"Category": "\*"})
ifcopenshell.api.cost.edit_cost_value(model,
cost_value=subvalue1, attributes={"AppliedValue": 2.0})
ifcopenshell.api.cost.edit_cost_value(model,
cost_value=subvalue2, attributes={"AppliedValue": 3.0})

    ifcopenshell.api.cost.assign_cost_item_quantity

Module Contents
class ifcopenshell.api.cost.assign_cost_item_quantity.Usecase
add_quantity_from_qto(qto: ifcopenshell.entity_instance) → None
add_quantity_from_related_object(element: ifcopenshell.entity_instance) → None
assign_cost_control(related_object: ifcopenshell.entity_instance, cost_item: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
execute()
update_cost_item_count()
file: ifcopenshell.file
settings: dict[str, Any]
ifcopenshell.api.cost.assign_cost_item_quantity.assign_cost_item_quantity(file: ifcopenshell.file, cost_item: ifcopenshell.entity_instance, products: list[ifcopenshell.entity_instance], prop_name: str = '') → None
Adds a cost item quantity that is parametrically connected to a product

A cost item may have its subtotal calculated by multiplying a unit value by a quantity associated with the cost item. That quantity may be either manually specified or parametrically connected to a quantity on a product. This API function lets you create that parametric connection.

For example, you may wish to have a cost item linked to the “NetVolume” quantity on all IfcSlabs. Each quantity has a name which you can specify. If the quantity is updated in-place (which should occur for Native IFC applications) then the quantity for the cost item will automatically update as well. If the quantity is deleted and then re-added, then the parametric relationship is also lost.

This API also automatically assigns a control relationship between the cost item and the product, so it is not necessary to use ifcopenshell.api.control.assign_control.

If cost item has just 1 quantity and it’s IfcQuantityCount, API will assume that quantity is used for counting controlled objects and it will recalculate the quantity value at the end of the API call.

Parameters:
cost_item (ifcopenshell.entity_instance) – The IfcCostItem to assign parametric quantities to

products (list[ifcopenshell.entity_instance]) – The IfcObjects to assign parametric quantities to

prop_name (str, optional) – The name of the quantity. If this is not specified, then it is assumed that there is no calculated quantity, and the number of objects are counted instead.

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)

# Let's imagine a unit cost of 5.0 per unit volume

value = ifcopenshell.api.cost.add_cost_value(model, parent=item)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 5.0})

slab = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSlab")

# Usually the quantity would be automatically calculated via a

# graphical authoring application but let's assign a manual quantity

# for now.

qto = ifcopenshell.api.pset.add_qto(model, product=slab, name="Qto_SlabBaseQuantities")
ifcopenshell.api.pset.edit_qto(model, qto=qto, properties={"NetVolume": 42.0})

# Now let's parametrically link the slab's quantity to the cost

# item. If the slab is edited in the future and 42.0 changes, then

# the updated value will also automatically be applied to the cost

# item.

ifcopenshell.api.cost.assign_cost_item_quantity(model,
cost_item=item, products=[slab], prop_name="NetVolume")

    ifcopenshell.api.cost.assign_cost_value

Module Contents
ifcopenshell.api.cost.assign_cost_value.assign_cost_value(file: ifcopenshell.file, cost_item: ifcopenshell.entity_instance, cost_rate: ifcopenshell.entity_instance) → None
Assigns a cost value to a cost item from a schedule of rates

Instead of assigning cost values from scratch for each cost item in a cost schedule, the cost values may instead be assigned from a schedule of rates.

A schedule of rates is just another cost schedule which have cost values but no quantities. This API will allow you to “copy” the values from a cost item in the schedule of rates into another cost item in your own cost schedule. When the schedule of rates value is updated, then your cost item values will also be updated. You can think of the schedule of rates as a “template” to quickly populate your rates from.

Parameters:
cost_item (ifcopenshell.entity_instance) – The IfcCostItem that you want to copy the values to

cost_rate (ifcopenshell.entity_instance) – The IfcCostItem that you want to copy the values from

Returns:
None

Return type:
None

Example:

# Let's create a schedule of rates with a single rate in it of 5.0

rate_tables = ifcopenshell.api.cost.add_cost_schedule(model,
predefined_type="SCHEDULEOFRATES")
rate = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
value = ifcopenshell.api.cost.add_cost_value(model, parent=rate)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 5.0})

# And this schedule will be for our actual cost plan / estimate / etc

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)

# Now the cost item has the same rate as the one from the schedule of rate's item

ifcopenshell.api.cost.assign_cost_value(model, cost_item=item, cost_rate=rate)

ifcopenshell.api.cost.calculate_cost_item_resource_value
Module Contents
ifcopenshell.api.cost.calculate_cost_item_resource_value.calculate_cost_item_resource_value(file: ifcopenshell.file, cost_item: ifcopenshell.entity_instance) → None
Calculates the total cost of all resources associated with a cost item

A cost item may have construction resources (e.g. equipment, material, etc) assigned to it. Construction resources may be assigned directly to the cost item, or assigned first to a task, and the task is then assigned to the cost item.

The cost of a resource is calculated by the total sum of all of its base costs. If no quantity is provided, that sum is considered to be the total cost. Otherwise, it is considered to be a unit cost, and is then multiplied by the resource quantity. The quantity is either stored as a base quantity (such as a volume) for a things like material resources, or as a duration as a daily rate for labour resources.

The final calculated cost is set as the cost item’s value. Any previously existing values are removed.

Parameters:
cost_item (ifccopenshell.entity_instance.entity_instance) – The IfcCostItem to calculate

Returns:
None

Return type:
None

Example:

# First, we need a cost schedule and item

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)

# Let's imagine we have our own formworking crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# ... and they need concrete

concrete = ifcopenshell.api.resource.add_resource(model,
ifc_class="IfcConstructionMaterialResource", parent_resource=crew)
ifcopenshell.api.control.assign_control(model,
relating_control=item, related_object=concrete)

# ... which has a unit price of 42.0 per m3

value = ifcopenshell.api.cost.add_cost_value(model, parent=concrete)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 42.0})

# ... and a volume of 200m3

quantity = ifcopenshell.api.resource.add_resource_quantity(model,
resource=concrete, ifc_class="IfcQuantityVolume")
ifcopenshell.api.resource.edit_resource_quantity(model,
physical_quantity=quantity, "attributes": {"VolumeValue": 200.0})

# Let's say they also need some equipment

equipment = ifcopenshell.api.resource.add_resource(model,
ifc_class="IfcConstructionEquipmentResource", parent_resource=crew)
ifcopenshell.api.control.assign_control(model,
relating_control=item, related_object=equipment)

# ... with a fixed price of 50,000

value = ifcopenshell.api.cost.add_cost_value(model, parent=concrete)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 42.0})

# (42 \* 200) + 50000 = 58400 is our calculated cost

ifcopenshell.api.cost.calculate_cost_item_resource_value(model, cost_item=item)

ifcopenshell.api.cost.copy_cost_item
Module Contents
class ifcopenshell.api.cost.copy_cost_item.Usecase
copy_indirect_attributes(from_element, to_element)
duplicate_cost_item(cost_item)
execute()
ifcopenshell.api.cost.copy_cost_item.copy_cost_item(file: ifcopenshell.file, cost_item: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | list[ifcopenshell.entity_instance]
Copies all cost items and related relationships

The following relationships are also duplicated:

The copy will have the same attributes and property sets as the original cost item

The copy will be assigned to the parent cost schedule

The copy will have duplicated nested cost items

Parameters:
cost_item (ifcopenshell.entity_instance) – The cost item to be duplicated

Returns:
The duplicated cost item or the list of duplicated cost items if the latter has children

Return type:
ifcopenshell.entity_instance or list[ifcopenshell.entity_instance]

Example: .. code:: python

# We have a cost item cost_item = CostItem(name=”Design new feature”, deadline=”2023-03-01”)

# And now we have two duplicated_cost_item = project.duplicate_cost_item(cost_item)

ifcopenshell.api.cost.copy_cost_item_values
Module Contents
ifcopenshell.api.cost.copy_cost_item_values.copy_cost_item_values(file: ifcopenshell.file, source: ifcopenshell.entity_instance, destination: ifcopenshell.entity_instance) → None
Copies all cost values from one cost item to another

Any previously existing values will be removed. The entire value is copied, including all components and formulas. However they are not parametrically linked, so if one value changes, the other will not.

Parameters:
source (ifcopenshell.entity_instance) – The IfcCostItem to copy cost values from

destination (ifcopenshell.entity_instance) – The IfcCostItem to copy cost values from

Returns:
None

Return type:
None

Example:

# Assume we have a schedule with multiple items in it

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item1 = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
item2 = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)

# One of the items has a value

value = ifcopenshell.api.cost.add_cost_value(model, parent=item)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 5000.0})

# Let's copy the value from one item to another

ifcopenshell.api.cost.copy_cost_item_values(model, source=item1, destination=item2)

ifcopenshell.api.cost.edit_cost_item
Module Contents
ifcopenshell.api.cost.edit_cost_item.edit_cost_item(file: ifcopenshell.file, cost_item: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcCostItem

For more information about the attributes and data types of an IfcCostItem, consult the IFC documentation.

Parameters:
cost_item (ifcopenshell.entity_instance) – The IfcCostItem entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
ifcopenshell.api.cost.edit_cost_item(model, cost_item=item, attributes={"Name": "Foo"})

ifcopenshell.api.cost.edit_cost_item_quantity
Module Contents
ifcopenshell.api.cost.edit_cost_item_quantity.edit_cost_item_quantity(file: ifcopenshell.file, physical_quantity: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcPhysicalQuantity

For more information about the attributes and data types of an IfcPhysicalQuantity, consult the IFC documentation.

Parameters:
physical_quantity (ifcopenshell.entity_instance) – The IfcPhysicalQuantity entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)

# This cost item will have a unit cost of 5 and a volume of 3

value = ifcopenshell.api.cost.add_cost_value(model, parent=item)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 5.0})
quantity = ifcopenshell.api.cost.add_cost_item_quantity(model,
cost_item=item, ifc_class="IfcQuantityVolume")
ifcopenshell.api.cost.edit_cost_item_quantity(model,
physical_quantity=quantity, "attributes": {"VolumeValue": 3.0})

    ifcopenshell.api.cost.edit_cost_schedule

Module Contents
ifcopenshell.api.cost.edit_cost_schedule.edit_cost_schedule(file: ifcopenshell.file, cost_schedule: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcCostSchedule

For more information about the attributes and data types of an IfcCostSchedule, consult the IFC documentation.

Parameters:
cost_schedule (ifcopenshell.entity_instance) – The IfcCostSchedule entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
ifcopenshell.api.cost.edit_cost_schedule(model,
cost_schedule=schedule, attributes={"Name": "Foo"})

    ifcopenshell.api.cost.edit_cost_value

Module Contents
ifcopenshell.api.cost.edit_cost_value.edit_cost_value(file: ifcopenshell.file, cost_value: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcCostValue

For more information about the attributes and data types of an IfcCostValue, consult the IFC documentation.

Parameters:
cost_value (ifcopenshell.entity_instance) – The IfcCostValue entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)

# This cost item will have a total cost of 42

value = ifcopenshell.api.cost.add_cost_value(model, parent=item)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 42.0})

    ifcopenshell.api.cost.edit_cost_value_formula

Module Contents
class ifcopenshell.api.cost.edit_cost_value_formula.Usecase
edit_cost_value(data, parent=None)
execute()
ifcopenshell.api.cost.edit_cost_value_formula.edit_cost_value_formula(file: ifcopenshell.file, cost_value: ifcopenshell.entity_instance, formula: str) → None
Sets a cost value based on a formula, similar to formulas in spreadsheets

Costs may be made up of many components (e.g. labour, material, waste factor, taxes, etc). This can be easily represented in the form of a formula similar thta would be used in spreadsheet applications.

For more information, see ifcopenshell.util.cost

Parameters:
cost_value (ifcopenshell.entity_instance) – The IfcCostValue to set the values of

formula (str) – The formula following the language of ifcopenshell.util.cost

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)

value = ifcopenshell.api.cost.add_cost_value(model, parent=item)
ifcopenshell.api.cost.edit_cost_value_formula(model, cost_value=value,
formula="5000 \* 1.19")

    ifcopenshell.api.cost.remove_cost_item

Module Contents
ifcopenshell.api.cost.remove_cost_item.remove_cost_item(file: ifcopenshell.file, cost_item: ifcopenshell.entity_instance) → None
Removes a cost item

All associated relationships with the cost item are also removed, however the related resources, products, and tasks themselves are retained.

Parameters:
cost_item (ifcopenshell.entity_instance) – The IfcCostItem entity you want to remove

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
ifcopenshell.api.cost.remove_cost_item(model, cost_item=item)

ifcopenshell.api.cost.remove_cost_item_quantity
Module Contents
ifcopenshell.api.cost.remove_cost_item_quantity.remove_cost_item_quantity(file: ifcopenshell.file, cost_item: ifcopenshell.entity_instance, physical_quantity: ifcopenshell.entity_instance) → None
Removes a quantity assigned to a cost item

If the quantity is part of a product (e.g. wall), then the quantity will still exist and merely the relationship to the cost item will be removed.

Parameters:
cost_item (ifcopenshell.entity_instance) – The IfcCostItem that the quantity is assigned to

physical_quantity (ifcopenshell.entity_instance) – The IfcPhysicalQuantity to remove

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
quantity = ifcopenshell.api.cost.add_cost_item_quantity(model,
cost_item=item, ifc_class="IfcQuantityVolume")

# Let's change our mind and delete it

ifcopenshell.api.cost.remove_cost_item(model,
cost_item=item, physical_quantity=quantity)

    ifcopenshell.api.cost.remove_cost_schedule

Module Contents
ifcopenshell.api.cost.remove_cost_schedule.remove_cost_schedule(file: ifcopenshell.file, cost_schedule: ifcopenshell.entity_instance) → None
Removes a cost schedule

All associated relationships with the cost schedule are also removed, including all cost items.

Parameters:
cost_schedule (ifcopenshell.entity_instance) – The IfcCostSchedule entity you want to remove

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)
ifcopenshell.api.cost.remove_cost_schedule(model, cost_schedule=schedule)

ifcopenshell.api.cost.remove_cost_value
Module Contents
ifcopenshell.api.cost.remove_cost_value.remove_cost_value(file: ifcopenshell.file, parent: ifcopenshell.entity_instance, cost_value: ifcopenshell.entity_instance) → None
Removes a cost value

The cost value may be assigned either to a cost item, a construction resource, or another cost value (i.e. it is a subcomponent of a cost)

Parameters:
parent (ifcopenshell.entity_instance) – The IfcCostItem, IfcConstructionResource, or IfcCostValue that the IfcCostValue is assigned to.

cost_value – The IfcCostValue that you want to remove

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)

# This cost item will have a unit cost of 5 and a volume of 3

value = ifcopenshell.api.cost.add_cost_value(model, parent=item)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 5.0})

ifcopenshell.api.cost.remove_cost_value(model, parent=item, cost_value=value)

ifcopenshell.api.cost.unassign_cost_item_quantity
Module Contents
class ifcopenshell.api.cost.unassign_cost_item_quantity.Usecase
execute()
update_cost_item_count()
ifcopenshell.api.cost.unassign_cost_item_quantity.unassign_cost_item_quantity(file: ifcopenshell.file, cost_item: ifcopenshell.entity_instance, products: list[ifcopenshell.entity_instance]) → None
Removes quantities of a cost item that are calculated on products

A cost item may have quantities that are parametrically calculated on physical products. This lets you remove those quantities. This means that any future changes in the physical product’s dimensions will not have any impact on the cost item.

Parameters:
cost_item (ifcopenshell.entity_instance) – The IfcCostItem to remove quantities from

products (list[ifcopenshell.entity_instance]) – A list of IfcProducts that may have parametrically connected quantities to the cost item

Returns:
None

Return type:
None

Example:

schedule = ifcopenshell.api.cost.add_cost_schedule(model)
item = ifcopenshell.api.cost.add_cost_item(model, cost_schedule=schedule)

# Let's imagine a unit cost of 5.0 per unit volume

value = ifcopenshell.api.cost.add_cost_value(model, parent=item)
ifcopenshell.api.cost.edit_cost_value(model, cost_value=value,
attributes={"AppliedValue": 5.0})

slab = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSlab")

# Usually the quantity would be automatically calculated via a

# graphical authoring application but let's assign a manual quantity

# for now.

qto = ifcopenshell.api.pset.add_qto(model, product=slab, name="Qto_SlabBaseQuantities")
ifcopenshell.api.pset.edit_qto(model, qto=qto, properties={"NetVolume": 42.0})

# Now let's parametrically link the slab's quantity to the cost

# item. If the slab is edited in the future and 42.0 changes, then

# the updated value will also automatically be applied to the cost

# item.

ifcopenshell.api.cost.assign_cost_item_quantity(model,
cost_item=item, products=[slab], prop_name="NetVolume")

# Let's change our mind and remove the parametric connection

ifcopenshell.api.cost.unassign_cost_item_quantity(model,
cost_item=item, products=[slab])

    ifcopenshell.api.document

Reference external project documents and associate them to model elements

Some project information (drawings, specifications, certificates, reports, etc) may be stored in external documents (locally or in a CDE). IFC lets you store a register of documents with metadata and associate them with elements (both physical and non-physical).

Submodules
ifcopenshell.api.document.add_information
ifcopenshell.api.document.add_reference
ifcopenshell.api.document.assign_document
ifcopenshell.api.document.edit_information
ifcopenshell.api.document.edit_reference
ifcopenshell.api.document.remove_information
ifcopenshell.api.document.remove_reference
ifcopenshell.api.document.unassign_document
Package Contents
ifcopenshell.api.document.add_information(file: ifcopenshell.file, parent: ifcopenshell.entity_instance | None = None) → ifcopenshell.entity_instance
Adds a new document information to the project

An IFC document information is a document associated with the project. It may be a drawing, specification, schedule, certificate, warranty guarantee, manual, contract, and so on. They are often used for drawings and facility management purposes.

A document may also be a subdocument of a larger document, this is useful for superseding documents or tracking older versions. The parent is considered the latest version and the children are older revisions.

Parameters:
parent (ifcopenshell.entity_instance, optional) – The parent document, if necessary.

Returns:
The newly created IfcDocumentInformation entity

Return type:
ifcopenshell.entity_instance

Example:

document = ifcopenshell.api.document.add_information(model)

# A document typically has a unique drawing or document name (which

# follows a coding system depending on the project), as well as a

# title. This should match what is shown on the titleblock or title

# page of the document. At a minimum you'd also want to specify a

# URI location. The location may be on local, or on a CDE, or any

# other platform.

ifcopenshell.api.document.edit_information(model,
information=document,
attributes={"Identification": "A-GA-6100", "Name": "Overall Plan",
"Location": "A-GA-6100 - Overall Plan.pdf"})
ifcopenshell.api.document.add_reference(file: ifcopenshell.file, information: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Creates a new reference to a document to assign to products

A document may be associated with physical products, tasks, cost items, and so on. For example, spaces, storeys, and buildings may have a list of associated drawings so you can see which drawings (e.g. plans, sections, details) are documenting that location. Alternatively, equipment may have associated training manuals, operation and maintenance manuals or detailed assembly drawings. Resources may be training certification required, schedules may have gantt charts or bid documents, and so on.

In order to associate a document with an object, a reference to that document needs to be created. It could be a reference to the entire document, or a reference to a particular page or chapter. See ifcopenshell.api.document.assign_document for more information.

Parameters:
information (ifcopenshell.entity_instance) – The IfcDocumentInformation that the reference will be created for

Returns:
The newly created IfcDocumentReference entity

Return type:
ifcopenshell.entity_instance

Example:

document = ifcopenshell.api.document.add_information(model)
ifcopenshell.api.document.edit_information(model,
information=document,
attributes={"Identification": "A-GA-6100", "Name": "Overall Plan",
"Location": "A-GA-6100 - Overall Plan.pdf"})

# In this case, we don't specify any more information, and so the

# reference is for the entire document, as opposed to a single page or

# chapter or section.

reference = ifcopenshell.api.document.add_reference(model, information=document)

# Alternatively, we can specify a single section, such as by a

# subheading code.

reference2 = ifcopenshell.api.document.add_reference(model, information=document)
ifcopenshell.api.document.edit_reference(model,
reference=reference2, attributes={"Identification": "2.1.15"})
ifcopenshell.api.document.assign_document(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], document: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Assigns a document to a list of products

An object may be assigned to zero, one, or multiple documents. Almost any object or property may be assigned to a document, though typically we’d only use it for spaces, types, physical products and schedules. Adding a new assignment is typically done using a document reference and an object. IFC technically allows association with a document information and an object, but this is not encouraged because it is not consistent with other external relationships (such as classification systems or libraries).

Parameters:
product (list[ifcopenshell.entity_instance]) – The list of objects to associate the document to. This could be almost any sensible object in IFC.

document (ifcopenshell.entity_instance) – The IfcDocumentReference to associate to, or alternatively an IfcDocumentInformation, though this is not recommended.

Returns:
The IfcRelAssociatesDocument relationship or None if products was an empty list or all products were already assigned to the document.

Return type:
ifcopenshell.entity_instance

Example:

document = ifcopenshell.api.document.add_information(model)
ifcopenshell.api.document.edit_information(model,
information=document,
attributes={"Identification": "A-GA-6100", "Name": "Overall Plan",
"Location": "A-GA-6100 - Overall Plan.pdf"})
reference = ifcopenshell.api.document.add_reference(model, information=document)

# Let's imagine storey represents an IfcBuildingStorey for the ground floor

ifcopenshell.api.document.assign_document(model, products=[storey], document=reference)
ifcopenshell.api.document.edit_information(file: ifcopenshell.file, information: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcDocumentInformation

For more information about the attributes and data types of an IfcDocumentInformation, consult the IFC documentation.

Parameters:
reference (ifcopenshell.entity_instance) – The IfcDocumentInformation entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

document = ifcopenshell.api.document.add_information(model)
ifcopenshell.api.document.edit_information(model,
information=document,
attributes={"Identification": "A-GA-6100", "Name": "Overall Plan",
"Location": "A-GA-6100 - Overall Plan.pdf"})
ifcopenshell.api.document.edit_reference(file: ifcopenshell.file, reference: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcDocumentReference

For more information about the attributes and data types of an IfcDocumentReference, consult the IFC documentation.

Parameters:
reference (ifcopenshell.entity_instance) – The IfcDocumentReference entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

document = ifcopenshell.api.document.add_information(model)
ifcopenshell.api.document.edit_information(model,
information=document,
attributes={"Identification": "A-GA-6100", "Name": "Overall Plan",
"Location": "A-GA-6100 - Overall Plan.pdf"})
reference = ifcopenshell.api.document.add_reference(model, information=document)
ifcopenshell.api.document.edit_reference(model,
reference=reference, attributes={"Identification": "2.1.15"})
ifcopenshell.api.document.remove_information(file: ifcopenshell.file, information: ifcopenshell.entity_instance) → None
Removes a document information

All references and associations are also removed.

Parameters:
information (ifcopenshell.entity_instance) – The IfcDocumentInformation to remove

Returns:
None

Return type:
None

Example:

# Add a document

document = ifcopenshell.api.document.add_information(model)

# ... and remove it!

ifcopenshell.api.document.remove_information(model, information=document)
ifcopenshell.api.document.remove_reference(file: ifcopenshell.file, reference: ifcopenshell.entity_instance) → None
Remove a document reference

All associations with objects are removed.

Parameters:
reference (ifcopenshell.entity_instance) – The IfcDocumentReference to remove

Returns:
None

Return type:
None

Example:

document = ifcopenshell.api.document.add_information(model)
reference = ifcopenshell.api.document.add_reference(model, information=document)
ifcopenshell.api.document.remove_reference(model, reference=reference)
ifcopenshell.api.document.unassign_document(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], document: ifcopenshell.entity_instance) → None
Unassigns a document and an association to the list of products

Parameters:
product (list[ifcopenshell.entity_instance]) – The list of objects that the document reference or information is related to.

document (ifcopenshell.entity_instance) – The IfcDocumentReference (typically) or in rare cases the IfcDocumentInformation that is associated with the product

Returns:
None

Return type:
None

Example:

document = ifcopenshell.api.document.add_information(model)
ifcopenshell.api.document.edit_information(model,
information=document,
attributes={"Identification": "A-GA-6100", "Name": "Overall Plan",
"Location": "A-GA-6100 - Overall Plan.pdf"})
reference = ifcopenshell.api.document.add_reference(model, information=document)

# Let's imagine storey represents an IfcBuildingStorey for the ground floor

ifcopenshell.api.document.assign_document(model, products=[storey], document=reference)

# Now let's change our mind and remove the association

ifcopenshell.api.document.unassign_document(model, products=[storey], document=reference)

ifcopenshell.api.drawing
Create relationships necessary for smart annotations for drawings

Drawings may be generated from modeled elements and annotations. These annotations may have relationships which indicate smart data being populated.

Submodules
ifcopenshell.api.drawing.assign_product
ifcopenshell.api.drawing.edit_text_literal
ifcopenshell.api.drawing.unassign_product
Package Contents
ifcopenshell.api.drawing.assign_product(file: ifcopenshell.file, relating_product: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Associates a product and an object, typically for annotation

Warning: this is an experimental API.

When you want to draw attention to a feature or characteristic (such as a dimension, material, or name) or of a product (e.g. wall, slab, furniture, etc), an annotation object is created. This annotation is then associated with the product so that it can reference attributes, properties, and relationships.

For example, an annotation of a line will be associated with a grid axis, such that when that grid axis moves, the annotation of that grid axis (which is typically truncated to the extents of a drawing) will also move.

Another example might be a label of a furniture product, which might have some text of the name of the furniture to be shown on drawings or in 3D.

Parameters:
relating_product (ifcopenshell.entity_instance) – The IfcProduct the object is related to

related_object (ifcopenshell.entity_instance) – The object (typically IfcAnnotation) that the product is related to

Returns:
The created IfcRelAssignsToProduct relationship

Return type:
ifcopenshell.entity_instance

Example:

furniture = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")
annotation = ifcopenshell.api.root.create_entity(model, ifc_class="IfcAnnotation")
ifcopenshell.api.drawing.assign_product(model,
relating_product=furniture, related_object=annotation)
ifcopenshell.api.drawing.edit_text_literal(file: ifcopenshell.file, text_literal: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcTextLiteral

For more information about the attributes and data types of an IfcTextLiteral, consult the IFC documentation.

Parameters:
reference (ifcopenshell.entity_instance) – The IfcTextLiteral entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

text = model.createIfcTextLiteral()
ifcopenshell.api.drawing.edit_text_literal(model,
text_literal=text, attributes={"Literal": "MY ANNOTATION"})
ifcopenshell.api.drawing.unassign_product(file: ifcopenshell.file, relating_product: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → None
Unassigns a product and an object (typically an annotation)

Smart annotation objects can be associated with products so that they can annotate attributes and properties. This function lets you remove the association, so that you may change the assocation with another object later or leave the annotation as a “dumb” annotation.

Parameters:
relating_product (ifcopenshell.entity_instance) – The IfcProduct the object is related to

related_object (ifcopenshell.entity_instance) – The object (typically IfcAnnotation) that the product is related to

Returns:
None

Return type:
None

Example:

furniture = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")
annotation = ifcopenshell.api.root.create_entity(model, ifc_class="IfcAnnotation")
ifcopenshell.api.drawing.assign_product(model,
relating_product=furniture, related_object=annotation)

# Let's change our mind and remove the relationship

ifcopenshell.api.drawing.unassign_product(model,
relating_product=furniture, related_object=annotation)

    ifcopenshell.api.geometry

Create geometric representations and assign them to elements

These functions support both the creation of arbitrary geometry as well as geometry that follows parametric rules (e.g. layered geometry or profiled geometry extrusions).

Submodules
ifcopenshell.api.geometry.add_axis_representation
ifcopenshell.api.geometry.add_boolean
ifcopenshell.api.geometry.add_door_representation
ifcopenshell.api.geometry.add_footprint_representation
ifcopenshell.api.geometry.add_mesh_representation
ifcopenshell.api.geometry.add_profile_representation
ifcopenshell.api.geometry.add_railing_representation
ifcopenshell.api.geometry.add_representation
ifcopenshell.api.geometry.add_slab_representation
ifcopenshell.api.geometry.add_wall_representation
ifcopenshell.api.geometry.add_window_representation
ifcopenshell.api.geometry.assign_representation
ifcopenshell.api.geometry.connect_element
ifcopenshell.api.geometry.connect_path
ifcopenshell.api.geometry.create_2pt_wall
ifcopenshell.api.geometry.disconnect_element
ifcopenshell.api.geometry.disconnect_path
ifcopenshell.api.geometry.edit_object_placement
ifcopenshell.api.geometry.map_representation
ifcopenshell.api.geometry.remove_boolean
ifcopenshell.api.geometry.remove_representation
ifcopenshell.api.geometry.unassign_representation
Package Contents
ifcopenshell.api.geometry.add_axis_representation(file: ifcopenshell.file, context: ifcopenshell.entity_instance, axis: tuple[COORD, COORD]) → ifcopenshell.entity_instance
Adds a new axis representation

Certain objects are typically “axis-based”, such as walls, beams, and columns. This means you can represent them abstractly by simply drawing a single line either in 2D (such as for walls) or 3D (for beams and columns). Humans can understand this axis-based representation as being a simplification of a layered extrusion or a profile that is being extruded along that axis and joined to other elements.

Using an axis-based representation makes it easy for users and computers to analyse connectivity and spatial relationships, as well as makes it easy to parametrically edit these objects by simply stretching the start or end of the axis.

For now, only simple straight line axes are supported, represented by a start and end coordinate. The order is important. For walls, the start must be at the minimum local X ordinate, and the end at the maximum local X ordinate. For beams and columns, the start is at the minimum local Z ordinate, and the end of the maximum local Z ordinate. The first coordinate is the “start” and the second coordinate is the “end”. This stat and end is then used to determine any parametric junctions with other elements.

Using an axis-representation is optional, but highly recommended for “standard” representations of walls, beams, columns, and other structural members. A rule of thumb is that if you can draw it as a line on paper, you can probably represent it using an axis.

Parameters:
context (ifcopenshell.entity_instance) – The IfcGeometricRepresentationContext that the representation is part of. This must be either a Model/Axis/GRAPH_VIEW (3D) or Plan/Axis/GRAPH_VIEW (2D).

axis (list[list[float]]) – The axis, as a list of two coordinates, the coordinates being either a list of 2 or 3 float coordinates depending on whether the axis is 2D or 3D.

Returns:
The newly created IfcShapeRepresentation entity

Return type:
ifcopenshell.entity_instance

Example:

context = ifcopenshell.util.representation.get_context(model, "Plan", "Axis", "GRAPH_VIEW")
axis = ifcopenshell.api.geometry.add_axis_representation(model,
context=context, axis=[(0.0, 0.0), (1.0, 0.0)])
ifcopenshell.api.geometry.add_boolean(file: ifcopenshell.file, representation: ifcopenshell.entity_instance, operator: str = 'DIFFERENCE', type: Literal['IfcHalfSpaceSolid', 'Mesh'] = 'IfcHalfSpaceSolid', matrix: NPArrayOfFloats | None = None, blender_obj: bpy.types.Object | None = None, blender_void: bpy.types.Object | None = None, should_force_faceted_brep: bool = False, should_force_triangulation: bool = False) → list[ifcopenshell.entity_instance]
For type values: - “IfcHalfSpaceSolid” - matrix is not optional. - “Mesh” - blender_obj and blender_void are not optional

ifcopenshell.api.geometry.add_footprint_representation(file, context: ifcopenshell.entity_instance, curves: list[ifcopenshell.entity_instance]) → ifcopenshell.entity_instance
ifcopenshell.api.geometry.add_mesh_representation(file: ifcopenshell.file, context: ifcopenshell.entity_instance, vertices: list[COORD_3D], edges: list[tuple[int, int]] = None, faces: list[list[int]] = None, cooridnate_offset: COORD_3D | None = None, unit_scale: float | None = None, force_faceted_brep: bool = False) → ifcopenshell.entity_instance
ifcopenshell.api.geometry.add_profile_representation(file: ifcopenshell.file, context: ifcopenshell.entity_instance, profile: ifcopenshell.entity_instance, depth: float = 1.0, cardinal_point: Literal[0, 1, 2, 3, 4, 5, 6, 7, 8, 9] = 5, clippings: list[ifcopenshell.util.data.Clipping | dict[str, Any]] | None = None, placement_zx_axes: tuple[VECTOR_3D | None, VECTOR_3D | None] = (None, None)) → ifcopenshell.entity_instance
ifcopenshell.api.geometry.add_slab_representation(file, context: ifcopenshell.entity_instance, depth: float = 0.2, x_angle: float = 0.0, clippings: list[ifcopenshell.util.data.Clipping | dict[str, Any]] | None = None) → ifcopenshell.entity_instance
ifcopenshell.api.geometry.add_wall_representation(file: ifcopenshell.file, context: ifcopenshell.entity_instance, length: float = 1.0, height: float = 3.0, offset: float = 0.0, thickness: float = 0.2, x_angle: float = 0.0, clippings: list[ifcopenshell.util.data.Clipping | dict[str, Any]] | None = None, booleans: list[ifcopenshell.entity_instance] | None = None) → ifcopenshell.entity_instance
ifcopenshell.api.geometry.assign_representation(file: ifcopenshell.file, product: ifcopenshell.entity_instance, representation: ifcopenshell.entity_instance) → None
ifcopenshell.api.geometry.connect_element(file: ifcopenshell.file, relating_element: ifcopenshell.entity_instance, related_element: ifcopenshell.entity_instance, description: str | None = None) → ifcopenshell.entity_instance
ifcopenshell.api.geometry.connect_path(file: ifcopenshell.file, relating_element: ifcopenshell.entity_instance, related_element: ifcopenshell.entity_instance, relating_connection: str = 'NOTDEFINED', related_connection: str = 'NOTDEFINED', description: str | None = None) → ifcopenshell.entity_instance
ifcopenshell.api.geometry.create_2pt_wall(file: ifcopenshell.file, element: ifcopenshell.entity_instance, context: ifcopenshell.entity_instance, p1: tuple[float, float], p2: tuple[float, float], elevation: float, height: float, thickness: float, is_si: bool = True) → ifcopenshell.entity_instance
ifcopenshell.api.geometry.disconnect_element(file: ifcopenshell.file, relating_element: ifcopenshell.entity_instance, related_element: ifcopenshell.entity_instance) → None
ifcopenshell.api.geometry.disconnect_path(file: ifcopenshell.file, element: ifcopenshell.entity_instance | None = None, connection_type: str | None = None, relating_element: ifcopenshell.entity_instance | None = None, related_element: ifcopenshell.entity_instance | None = None) → None
There are two options to use this API method: - provide element (connected from) and connection_type that should be disconnected. - provide connected elements to disconnect explicitly: relating_element (connected from) and related_element (connected to)

ifcopenshell.api.geometry.edit_object_placement(file: ifcopenshell.file, product: ifcopenshell.entity_instance, matrix: NPArrayOfFloats | None = None, is_si: bool = True, should_transform_children: bool = False) → ifcopenshell.entity_instance
ifcopenshell.api.geometry.map_representation(file: ifcopenshell.file, representation: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
ifcopenshell.api.geometry.remove_boolean(file: ifcopenshell.file, item: ifcopenshell.entity_instance) → None
ifcopenshell.api.geometry.remove_representation(file: ifcopenshell.file, representation: ifcopenshell.entity_instance) → None
Remove a representation.

Also purges representation items and their related elements like IfcStyledItem, tessellated facesets colours and UV map.

Parameters:
representation (ifcopenshell.entity_instance) – IfcRepresentation to remove. Note that it’s expected that IfcRepresentation won’t be in use before calling this method (in such elements as IfcProductRepresentation, IfcShapeAspect) otherwise representation won’t be removed.

Returns:
None

Return type:
None

ifcopenshell.api.geometry.unassign_representation(file: ifcopenshell.file, product: ifcopenshell.entity_instance, representation: ifcopenshell.entity_instance) → None

ifcopenshell.api.georeference
Manage georeferencing metadata

IFC model geometry may have a coordinate reference system (CRS) assigned to it. It may also optionally have a map conversion defined to transform to and from map coordinates and project local engineering coordinates.

Submodules
ifcopenshell.api.georeference.add_georeferencing
ifcopenshell.api.georeference.edit_georeferencing
ifcopenshell.api.georeference.edit_true_north
ifcopenshell.api.georeference.edit_wcs
ifcopenshell.api.georeference.remove_georeferencing
Package Contents
ifcopenshell.api.georeference.add_georeferencing(file: ifcopenshell.file, ifc_class: str = 'IfcMapConversion', name: str = 'EPSG:3857') → None
Add empty georeferencing entities to a model

By default, models are not georeferenced. Georeferencing requires two entities: a definition of the projected coordinated reference system (CRS) used, and the transformation parameters between any local coordinate system and that projected CRS if any.

This function will create the entities to store the projected CRS and map conversion transformation, but will leave all the parameters blank. It is this the users responsibility to specify the correct georeferencing parameters. See ifcopenshell.api.georeference.edit_georeferencing.

Parameters:
ifc_class – A type of IfcCoordinateOperation. For IFC2X3, this has no impact and only uses ePSet_MapConversion.

Example:

ifcopenshell.api.georeference.add_georeferencing(model)
ifcopenshell.api.georeference.edit_georeferencing(file: ifcopenshell.file, coordinate_operation: dict[str, Any] | None = None, projected_crs: dict[str, Any] | None = None) → None
Edits the attributes of a map conversion, projected CRS, and true north

Setting the correct georeferencing parameters is a complex topic and should ideally be done with three parties present: the lead architect, surveyor, and a third-party digital engineer with expertise in IFC to moderate. For more information, read the Bonsai documentation for Georeferencing: https://docs.bonsaibim.org/users/advanced/georeferencing.html

For more information about the attributes and data types of an IfcCoordinateOperation, consult the IFC documentation.

For more information about the attributes and data types of an IfcProjectedCRS, consult the IFC documentation.

See ifcopenshell.util.geolocation for more utilities to convert to and from local and map coordinates to check your results.

Parameters:
coordinate_operation – The dictionary of attribute names and values you want to edit.

projected_crs – The IfcProjectedCRS dictionary of attribute names and values you want to edit.

Example:

ifcopenshell.api.georeference.add_georeferencing(model)

# This is the simplest scenario, a defined CRS (GDA2020 / MGA Zone

# 56, typically used in Sydney, Australia) but with no local

# coordinates. This is only recommended for horizontal construction

# projects, not for vertical construction (such as buildings).

ifcopenshell.api.georeference.edit_georeferencing(model,
projected_crs={"Name": "EPSG:7856"})

# For buildings, it is almost always recommended to specify map

# conversion parameters to a false origin and orientation to project

# north. See the diagram in the Bonsai Georeferencing

# documentation for correct calculation of the X Axis Abcissa and

# Ordinate.

ifcopenshell.api.georeference.edit_georeferencing(model,
projected_crs={"Name": "EPSG:7856"},
coordinate_operation={
"Eastings": 335087.17, # The architect nominates a false origin
"Northings": 6251635.41, # The architect nominates a false origin # Note: this is the angle difference between Project North # and Grid North. Remember: True North should never be used!
"XAxisAbscissa": cos(radians(-30)), # The architect nominates a project north
"XAxisOrdinate": sin(radians(-30)), # The architect nominates a project north
"Scale": 0.99956, # Ask your surveyor for your site's average combined scale factor!
})
ifcopenshell.api.georeference.edit_true_north(file: ifcopenshell.file, true_north: tuple[float, float] | float | None = 0.0) → None
Edits the true north

Given project north being up (i.e. a vector of 0, 1), true north is defined as a unitised 2D vector pointing to true north. Alternatively, true north may be defined as a rotation from project north to true north. Anticlockwise is positive.

Note that true north is not part of georeferencing, and is only optionally provided as a reference value, typically for solar analysis. Remember: grid north (what your surveyor will typically use) is not the same as true north!

Parameters:
true_north – A unitised 2D vector, where each ordinate is a float, or an angle in decimal degrees where anticlockwise is positive.

Example:

# Both of these are identical, and indicate that:

# - If project north is up the page, true north is in the top left

# - The building is therefore facing north east

ifcopenshell.api.georeference.edit_true_north(model, true_north=30)
ifcopenshell.api.georeference.edit_true_north(model, true_north=(-0.5, 0.8660254))

# This unsets true north

ifcopenshell.api.georeference.edit_true_north(model, true_north=None)
ifcopenshell.api.georeference.edit_wcs(file: ifcopenshell.file, x: float = 0.0, y: float = 0.0, z: float = 0.0, rotation: float = 0.0, is_si: bool = True) → None
Edits the WCS for all geometric contexts to a translation and rotation

Typically, a project’s local engineering origin (0, 0, 0) has a coordinate operation (e.g. map conversion) to a projected CRS. If a WCS is provided, the coordinate operation is relative to the WCS, not the local engineering origin.

For example, if I have an IfcSite with a placement at (10, 0, 0) and a map conversion of (50, 0, 0), my IfcSite’s local XYZ is at (10, 0, 0) with an ENH (Easting, Northing, Height) of (60, 0, 0).

If I then define by WCS at (15, 0, 0), my IfcSite’s local XYZ is still at (10, 0, 0) but its ENH is now at (45, 0, 0).

It’s recommended to leave the WCS at 0,0,0. Please :)

Parameters:
x – The X translation of the WCS

y – The Y translation of the WCS

z – The Z translation of the WCS

rotation – The rotation around the Z axis (i.e. top down plan view) in decimal degrees of the WCS. Anticlockwise is positive.

Example:

# This is the simplest scenario, resetting the WCS to 0,0,0 with no rotation (recommended)

ifcopenshell.api.georeference.edit_wcs(model)
ifcopenshell.api.georeference.remove_georeferencing(file: ifcopenshell.file) → None
Remove georeferencing data

All georeferencing parameters such as projected CRS and map conversion data will be lost.

In IFC2X3, the psets will be removed from the IfcProject.

Example:

ifcopenshell.api.georeference.add_georeferencing(model) # Let’s change our mind ifcopenshell.api.georeference.remove_georeferencing(model)

ifcopenshell.api.grid
Manages grid and grid axes

A grid in IFC may contain two or more axes running in two or more directions.

Submodules
ifcopenshell.api.grid.create_axis_curve
ifcopenshell.api.grid.create_grid_axis
ifcopenshell.api.grid.remove_grid_axis
Package Contents
ifcopenshell.api.grid.create_grid_axis(file: ifcopenshell.file, grid: ifcopenshell.entity_instance, axis_tag: str = 'A', same_sense: bool = True, uvw_axes: Literal['UAxes', 'VAxes', 'WAxes'] = 'UAxes') → ifcopenshell.entity_instance
Adds a new grid axis to a grid

An IFC grid will typically have a minimum of two axes which will be perpendicular to one another. Grids may be rectangular (typically perpendicular lines), radial (where one set of axes is a circle and the other is a line), or triangular (three sets of axes, each at a different angle to one another).

For a simple rectangular grid, the “UAxes” are a set of one or more horizontal axes, which are typically labeled with the convention of A, B, C, etc. The “VAxes” is another set of one or more vertical axes, typically labeled with the convention of 1, 2, 3, etc. These axes are horizontal or vertical relative to project north.

For a radial grid, the “UAxes” are straight lines, typically radiating from a central point. The “VAxes” are circular perimeters, with the center of these circles being the same central point.

For a triangular grid, the UAxes, VAxes, and WAxes are all sets of one or more straight lines.

Parameters:
axis_tag (str, optional) – The name of the axis, that would typically be labeled on drawings or described on site during coordination, such as A, B, C, 1, 2, 3, etc. Defaults to “A”.

same_sense (bool, optional) – Determines whether the direction of the axis’s line is reversed. True means the direction the geometry is defined in represents the direction of the axis. False means the direction is reversed. Leave as True if unsure. Defaults to “True”.

uvw_axes (str, optional) – Choose from “UAxes”, “VAxes” or “WAxes” depending on which set of axes the new axis you are adding should belong to. Defaults to “UAxes”.

grid (ifcopenshell.entity_instance) – The IfcGrid you are adding the axis to.

Returns:
The newly created IfcGridAxis

Return type:
ifcopenshell.entity_instance

Example:

# A pretty standard rectangular grid, with only two axes. grid = ifcopenshell.api.root.create_entity(model, ifc_class=”IfcGrid”) axis_a = ifcopenshell.api.grid.create_grid_axis(model,

axis_tag=”A”, uvw_axes=”UAxes”, grid=grid)

axis_1 = ifcopenshell.api.grid.create_grid_axis(model,
axis_tag=”1”, uvw_axes=”VAxes”, grid=grid)

ifcopenshell.api.grid.remove_grid_axis(file: ifcopenshell.file, axis: ifcopenshell.entity_instance) → None
Removes a grid axis from a grid

Parameters:
axis (ifcopenshell.entity_instance) – The IfcGridAxis you want to remove.

Returns:
None

Return type:
None

Example:

# A pretty standard rectangular grid, with only two axes. grid = ifcopenshell.api.root.create_entity(model, ifc_class=”IfcGrid”) axis_a = ifcopenshell.api.grid.create_grid_axis(model,

axis_tag=”A”, uvw_axes=”UAxes”, grid=grid)

axis_1 = ifcopenshell.api.grid.create_grid_axis(model,
axis_tag=”1”, uvw_axes=”VAxes”, grid=grid)

# Let’s create a third so we can remove it later axis_2 = ifcopenshell.api.grid.create_grid_axis(model,

axis_tag=”2”, uvw_axes=”VAxes”, grid=grid)

# Let’s remove it! ifcopenshell.api.grid.remove_grid_axis(model, axis=axis_2)

ifcopenshell.api.group
Elements may be arbitrarily assigned to groups for organisation

Groups are useful for filtering elements or non-hierarchical organisation of a model. Note that this only targets arbitrary groups. If you want to group elements into a distribution system, see ifcopenshell.api.system.

Submodules
ifcopenshell.api.group.add_group
ifcopenshell.api.group.assign_group
ifcopenshell.api.group.edit_group
ifcopenshell.api.group.remove_group
ifcopenshell.api.group.unassign_group
ifcopenshell.api.group.update_group_products
Package Contents
ifcopenshell.api.group.add_group(file: ifcopenshell.file, name: str = 'Unnamed', description: str | None = None) → ifcopenshell.entity_instance
Adds a new group

An IFC group is an arbitrary collection of products, which are typically physical. It may be used when there is no other more specific group which may be used. Other types of groups include distribution systems, which group together products that are connected and circulate a medium (such as fluid or electricity), or zones, which group together spaces, or structural load groups, which group together loads for structural analysis, or inventories, which are groups of assets.

Parameters:
Name (str, optional) – The name of the group. Defaults to “Unnamed”

description (str, optional) – The description of the purpose of the group.

Returns:
The newly created IfcGroup

Return type:
ifcopenshell.entity_instance

Example:

ifcopenshell.api.group.add_group(model, name="Unit 1A")
ifcopenshell.api.group.assign_group(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], group: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Assigns products to a group

If a product is already assigned to the group, it will not be assigned twice.

Parameters:
products (list[ifcopenshell.entity_instance]) – A list of IfcProduct elements to assign to the group

group (ifcopenshell.entity_instance) – The IfcGroup to assign the products to

Returns:
The IfcRelAssignsToGroup relationship or None if products was empty list.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

group = ifcopenshell.api.group.add_group(model, name="Furniture")
ifcopenshell.api.group.assign_group(model,
products=model.by_type("IfcFurniture"), group=group)
ifcopenshell.api.group.edit_group(file: ifcopenshell.file, group: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcGroup

For more information about the attributes and data types of an IfcGroup, consult the IFC documentation.

Parameters:
group (ifcopenshell.entity_instance) – The IfcGroup entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

group = ifcopenshell.api.group.add_group(model, name="Unit 1A")
ifcopenshell.api.group.edit_group(model,
group=group, attributes={"Description": "All furniture and joinery included in the unit"})
ifcopenshell.api.group.remove_group(file: ifcopenshell.file, group: ifcopenshell.entity_instance) → None
Removes a group

All products assigned to the group will remain, but the relationship to the group will be removed.

Parameters:
group (ifcopenshell.entity_instance) – The IfcGroup entity you want to remove

Returns:
None

Return type:
None

Example:

group = ifcopenshell.api.group.add_group(model, name="Unit 1A")
ifcopenshell.api.group.remove_group(model, group=group)
ifcopenshell.api.group.unassign_group(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], group: ifcopenshell.entity_instance) → None
Unassigns products from a group

If the product isn’t assigned to the group, nothing will happen.

Parameters:
products (list[ifcopenshell.entity_instance]) – A list of IfcProduct elements to unassign from the group

group (ifcopenshell.entity_instance) – The IfcGroup to unassign from

Returns:
None

Return type:
None

Example:

group = ifcopenshell.api.group.add_group(model, name="Furniture")
furniture = model.by_type("IfcFurniture")
ifcopenshell.api.group.assign_group(model, products=furniture, group=group)

bad_furniture = furniture[0]
ifcopenshell.api.group.unassign_group(model, products=[bad_furniture], group=group)
ifcopenshell.api.group.update_group_products(file: ifcopenshell.file, group: ifcopenshell.entity_instance, products: list[ifcopenshell.entity_instance]) → ifcopenshell.entity_instance
Sets a group products to be an explicit list of products

Any previous products assigned to that group will have their assignment removed.

Parameters:
products (list[ifcopenshell.entity_instance]) – A list of IfcProduct elements to assign to the group

group (ifcopenshell.entity_instance) – The IfcGroup to assign the products to

Returns:
The IfcRelAssignsToGroup relationship

Return type:
ifcopenshell.entity_instance

Example:

group = ifcopenshell.api.group.add_group(model, name="Furniture")
ifcopenshell.api.group.update_group_products(model,
products=model.by_type("IfcFurniture"), group=group)

ifcopenshell.api.layer
Manage CAD layers

Note that in IFC, elements cannot be assigned to CAD layers. Instead, the geometric representation of the element is associated to a layer.

If you want to associated a whole element to a “layer”, consider using ifcopenshell.api.classification.

Submodules
ifcopenshell.api.layer.add_layer
ifcopenshell.api.layer.assign_layer
ifcopenshell.api.layer.edit_layer
ifcopenshell.api.layer.remove_layer
ifcopenshell.api.layer.unassign_layer
Package Contents
ifcopenshell.api.layer.add_layer(file: ifcopenshell.file, name: str = 'Unnamed') → ifcopenshell.entity_instance
Adds a new layer

An IFC layer is like a CAD layer. Portions of an object’s geometry (typically portions of its 2D linework) can be assigned to layers, which can provide stylistic information such as line weights, colours, or simply be used for filtering.

Layers have historically been used to organise CAD data and included in ISO standards such as ISO 13567 or by the AIA. This alllows IFC data to be compatible with older, 2D-oriented, layer-based workflows.

Some software that are still based on layers, such as Tekla or ArchiCAD may also use this layer information for filtering.

Parameters:
name (str, optional) – The name of the layer. Defaults to “Unnamed”.

Returns:
The newly created IfcPresentationLayerAssignment element

Return type:
ifcopenshell.entity_instance

Example:

ifcopenshell.api.layer.add_layer(model, name=”AI-WALL-FULL-DIMS-N”)

ifcopenshell.api.layer.assign_layer(file: ifcopenshell.file, items: list[ifcopenshell.entity_instance], layer: ifcopenshell.entity_instance) → None
Assigns representation items to a layer

In IFC, instead of objects being assigned to layers, representation items are assigned to layers. Representation items are portions of the object’s representation. For example, this allows a single IFC Window element to have portions of its 2D linework (e.g. the cross section of its frame) assigned to one layer, and another portion (e.g. the glazing panels) assigned to another layer.

Parameters:
items (list[ifcopenshell.entity_instance]) – The list of IfcRepresentationItems to assign to the layer. This should be the items from the object’s IfcShapeRepresentation.

layer (ifcopenshell.entity_instance) – The IfcPresentationLayerAssignment layer to assign the item to.

Returns:
None

Return type:
None

Example:

# Remember, all geometry needs to specify the context it is part of first.

# See ifcopenshell.api.context.add_context for details.

model = ifcopenshell.api.context.add_context(model, context_type="Model")
body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model
)

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=5, height=3, thickness=0.2)
ifcopenshell.api.geometry.assign_representation(model,
product=wall, representation=representation)
ifcopenshell.api.geometry.edit_object_placement(model, product=wall)

# Now let's create a layer that contains walls

layer = ifcopenshell.api.layer.add_layer(model, name="AI-WALL")

# And assign our wall representation item (in this example, there is

# only one item) to the layer.

ifcopenshell.api.layer.assign_layer(model, items=[representation.Items[0]], layer=layer)
ifcopenshell.api.layer.edit_layer(file: ifcopenshell.file, layer: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcPresentationLayerAssignment

For more information about the attributes and data types of an IfcPresentationLayerAssignment, consult the IFC documentation.

Parameters:
layer (ifcopenshell.entity_instance) – The IfcPresentationLayerAssignment entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

layer = ifcopenshell.api.layer.add_layer(model, name="AI-WALL")
ifcopenshell.api.layer.edit_layer(model,
layer=layer, attributes={"Description": "All walls, based on the AIA standard."})
ifcopenshell.api.layer.remove_layer(file: ifcopenshell.file, layer: ifcopenshell.entity_instance) → None
Removes a layer

All representation items assigned to the layer will remain, but the relationship to the layer will be removed.

Parameters:
layer (ifcopenshell.entity_instance) – The IfcPresentationLayerAssignment entity to remove

Returns:
None

Return type:
None

Example:

layer = ifcopenshell.api.layer.add_layer(model, name="AI-WALL")
ifcopenshell.api.layer.remove_layer(model, layer=layer)
ifcopenshell.api.layer.unassign_layer(file: ifcopenshell.file, items: list[ifcopenshell.entity_instance], layer: ifcopenshell.entity_instance) → None
Unassigns representation items from a layer

If the representation item isn’t assigned to the layer, nothing will happen. If after unassignment layer won’t have any assigned items it will be removed to keep IFC valid.

Parameters:
items (list[ifcopenshell.entity_instance]) – A list IfcRepresentationItem elements to unassign

layer (ifcopenshell.entity_instance) – The IfcPresentationLayerAssignment to unassign from

Returns:
None

Return type:
None

Example:

# Remember, all geometry needs to specify the context it is part of first.

# See ifcopenshell.api.context.add_context for details.

model = ifcopenshell.api.context.add_context(model, context_type="Model")
body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model
)

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=5, height=3, thickness=0.2)
ifcopenshell.api.geometry.assign_representation(model,
product=wall, representation=representation)
ifcopenshell.api.geometry.edit_object_placement(model, product=wall)

# Now let's create a layer that contains walls

layer = ifcopenshell.api.layer.add_layer(model, name="AI-WALL")

# And assign our wall representation item (in this example, there is

# only one item) to the layer.

ifcopenshell.api.layer.assign_layer(model, items=[representation.Items[0]], layer=layer)

# Let's undo it!

ifcopenshell.api.layer.unassign_layer(model, items=[representation.Items[0]], layer=layer)

ifcopenshell.api.library
Manage references to external libraries

An external library is any system which uses a key to store information. This allows you to associate IFC entities with any arbitrary external database, API, system, and so on. This is typically useful in smart building systems.

Submodules
ifcopenshell.api.library.add_library
ifcopenshell.api.library.add_reference
ifcopenshell.api.library.assign_reference
ifcopenshell.api.library.edit_library
ifcopenshell.api.library.edit_reference
ifcopenshell.api.library.remove_library
ifcopenshell.api.library.remove_reference
ifcopenshell.api.library.unassign_reference
Package Contents
ifcopenshell.api.library.add_library(file: ifcopenshell.file, name: str) → ifcopenshell.entity_instance
Adds a new library to the project

A library is an external data source that is related to the project. It may be a database, a spreadsheet, an API, or even a stack of papers in a filing cabinet. This allows IFC data to store relationships to these external data sources.

For example, you may have a list of laser scans of a site stored in an online platform, which can be queried using an API. Or, you might have a database of live building sensor data. So long as there is a clear identifier you can use to link the two datasets together, you can create a relationship.

Note that IFC does not store any instructions on how to access the library. It does not specify whether a HTTP request or database connection needs to be made or what protocol the library operates with. Until this is fleshed out further, it is the users responsibility to name the libraries consistently and use appropriate identifiers. For example, if you are linking IFC data and Brickschema data, use a full URI for the identifier with no abbreviation (e.g. ‘http://example.org/digitaltwin#AHU01’, not ‘digitaltwin:AHU01’).

A library will then contain a list of references within that library. These references will then be related to IFC elements. For example, a library will represent an external database, and a reference will point to a particular table and row within that database.

Parameters:
name (str) – The name of the library

Returns:
The newly created IfcLibraryInformation

Return type:
ifcopenshell.entity_instance

Example:

ifcopenshell.api.library.add_library(model, name="Brickschema")
ifcopenshell.api.library.add_reference(file: ifcopenshell.file, library: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Adds a new reference to a library

A library represents an external data source, such as a database, spreadsheet, API, or something else that contains information related to the IFC project. Within a library, there will be one or more references, such as reference to a particular table or row in a database, or a sheet and row or column in a spreadsheet, a URI in a linked data Brickschema file, 32-bit decimal BACnetObjectIdentifier in a BACnet system, IP address in a network, and so on.

These references can then be related to IFC elements. You cannot relate an IFC element directly to a library, it must be related to one of the library’s references.

Parameters:
library (ifcopenshell.entity_instance) – The IfcLibraryInformation element to add a reference to

Returns:
The newly created IfcLibraryReference element

Return type:
ifcopenshell.entity_instance

Example:

library = ifcopenshell.api.library.add_library(model, name="Brickschema")

# Let's create a reference to a single AHU in our Brickschema dataset

reference = ifcopenshell.api.library.add_reference(model, library=library)
ifcopenshell.api.library.edit_reference(model,
reference=reference, attributes={"Identification": "http://example.org/digitaltwin#AHU01"})
ifcopenshell.api.library.assign_reference(file: ifcopenshell.file, products: ifcopenshell.entity_instance, reference: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Associates a list products with a library reference

A product may be associated with zero, one, or many references across multiple libraries. See ifcopenshell.api.library.add_reference for more detail about how references work.

Parameters:
products (list[ifcopenshell.entity_instance]) – The list of IfcProducts you want to associate with the reference

reference (ifcopenshell.entity_instance) – The IfcLibraryReference you want the product to be associated with.

Returns:
The IfcRelAssociatesLibrary relationship entity or None if products was an empty list or all products were already assigned to the reference.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

library = ifcopenshell.api.library.add_library(model, name="Brickschema")

# Let's create a reference to a single AHU in our Brickschema dataset

reference = ifcopenshell.api.library.add_reference(model, library=library)
ifcopenshell.api.library.edit_reference(model,
reference=reference, attributes={"Identification": "http://example.org/digitaltwin#AHU01"})

# Let's assume we have an AHU in our model.

ahu = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcUnitaryEquipment", predefined_type="AIRHANDLER")

# And now assign the IFC model's AHU with its Brickschema counterpart

ifcopenshell.api.library.assign_reference(model, reference=reference, products=[ahu])
ifcopenshell.api.library.edit_library(file: ifcopenshell.file, library: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcLibraryInformation

For more information about the attributes and data types of an IfcLibraryInformation, consult the IFC documentation.

Parameters:
library (ifcopenshell.entity_instance) – The IfcLibraryInformation entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

library = ifcopenshell.api.library.add_library(model, name="Brickschema")
ifcopenshell.api.library.edit_library(model, library=library,
attributes={"Description": "A Brickschema TTL including only mechanical distribution systems."})
ifcopenshell.api.library.edit_reference(file: ifcopenshell.file, reference: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcLibraryReference

For more information about the attributes and data types of an IfcLibraryReference, consult the IFC documentation.

Parameters:
reference (ifcopenshell.entity_instance) – The IfcLibraryReference entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

library = ifcopenshell.api.library.add_library(model, name="Brickschema")

# Let's create a reference to a single AHU in our Brickschema dataset

reference = ifcopenshell.api.library.add_reference(model, library=library)
ifcopenshell.api.library.edit_reference(model,
reference=reference, attributes={"Identification": "http://example.org/digitaltwin#AHU01"})
ifcopenshell.api.library.remove_library(file: ifcopenshell.file, library: ifcopenshell.entity_instance) → None
Removes a library

All references along with their relationships will also be removed. Any products which have relationships to this library will not be removed.

Parameters:
library (ifcopenshell.entity_instance) – The IfcLibraryInformation entity you want to remove

Returns:
None

Return type:
None

Example:

library = ifcopenshell.api.library.add_library(model, name="Brickschema")
ifcopenshell.api.library.remove_library(model, library=library)
ifcopenshell.api.library.remove_reference(file: ifcopenshell.file, reference: ifcopenshell.entity_instance) → None
Removes a library reference

Any products which have relationships to this reference will not be removed.

Parameters:
reference (ifcopenshell.entity_instance) – The IfcLibraryReference entity you want to remove

Returns:
None

Return type:
None

Example:

library = ifcopenshell.api.library.add_library(model, name="Brickschema")
reference = ifcopenshell.api.library.add_reference(model, library=library)

# Let's change our mind and remove it.

ifcopenshell.api.library.remove_reference(model, reference=reference)
ifcopenshell.api.library.unassign_reference(file: ifcopenshell.file, reference: ifcopenshell.entity_instance, products: list[ifcopenshell.entity_instance]) → None
Unassigns a product of products from a reference

If the product isn’t assigned to the reference, nothing will happen.

Parameters:
reference (ifcopenshell.entity_instance) – The IfcLibraryReference to unassign from

products (list[ifcopenshell.entity_instance]) – A list of IfcProduct elements to unassign from the reference

Returns:
None

Return type:
None

Example:

library = ifcopenshell.api.library.add_library(model, name="Brickschema")

# Let's create a reference to a single AHU in our Brickschema dataset

reference = ifcopenshell.api.library.add_reference(model, library=library)
ifcopenshell.api.library.edit_reference(model,
reference=reference, attributes={"Identification": "http://example.org/digitaltwin#AHU01"})

# Let's assume we have an AHU in our model.

ahu = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcUnitaryEquipment", predefined_type="AIRHANDLER")

# And now assign the IFC model's AHU with its Brickschema counterpart

ifcopenshell.api.library.assign_reference(model, reference=reference, products=[ahu])

# Let's change our mind and unassign it.

ifcopenshell.api.library.unassign_reference(model, reference=reference, products=[ahu])

ifcopenshell.api.material
Manage physical materials (concrete, steel, etc) and their association to elements

IFC supports both simple materials and parametric materials (materials that have layered thicknesses or cross sectional profiles).

Parametric materials will include parametric constraints on the geometry of the element. These API functions do not cover that responsibility. See ifcopenshell.api.geometry.

Note that this API only covers physical materials, not visual styles. If you want to look at visual styles such as colours, transparency, shading, or rendering options, see ifcopenshell.api.style.

Submodules
ifcopenshell.api.material.add_constituent
ifcopenshell.api.material.add_layer
ifcopenshell.api.material.add_list_item
ifcopenshell.api.material.add_material
ifcopenshell.api.material.add_material_set
ifcopenshell.api.material.add_profile
ifcopenshell.api.material.assign_material
ifcopenshell.api.material.assign_profile
ifcopenshell.api.material.copy_material
ifcopenshell.api.material.edit_assigned_material
ifcopenshell.api.material.edit_constituent
ifcopenshell.api.material.edit_layer
ifcopenshell.api.material.edit_layer_usage
ifcopenshell.api.material.edit_material
ifcopenshell.api.material.edit_profile
ifcopenshell.api.material.edit_profile_usage
ifcopenshell.api.material.remove_constituent
ifcopenshell.api.material.remove_layer
ifcopenshell.api.material.remove_list_item
ifcopenshell.api.material.remove_material
ifcopenshell.api.material.remove_material_set
ifcopenshell.api.material.remove_profile
ifcopenshell.api.material.reorder_set_item
ifcopenshell.api.material.unassign_material
Package Contents
ifcopenshell.api.material.add_constituent(file: ifcopenshell.file, constituent_set: ifcopenshell.entity_instance, material: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Adds a new constituent to a constituent set

A constituent describes how a portion of an object is made out of a material whereas other portions of the object is made out of other materials. For example, a window might be made out of an aluminium frame and a glass panel. The aluminium used for the frame is one constituent of the material, and glass would be another constituent. Another example might be concrete, where one constituent might be cement, and another constituent might be binder. In the case of the window, the constituent is represented explicitly by the geometry of the window frame and the geometry of the window panel. In the case of a concrete slab, the constituents might be represented in terms of percentages.

Constituents are not available in IFC2X3.

Parameters:
constituent_set (ifcopenshell.entity_instance) – The IfcMaterialConstituentSet that the constituent is part of. The constituent set represents a group of constituents. See ifcopenshell.api.material.add_material_set for information on how to add a constituent set.

material (ifcopenshell.entity_instance) – The IfcMaterial that the constituent is made out of.

Returns:
The newly created IfcMaterialConstituent

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we have a window type that has an aluminium frame

# and a glass glazing panel. Notice we are assigning to the type

# only, as all occurrences of that type will automatically inherit

# the material.

window_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWindowType")

# First, let's create a constituent set. This will later be assigned

# to our window element.

material_set = ifcopenshell.api.material.add_material_set(model,
name="Window", set_type="IfcMaterialConstituentSet")

# Let's create a few materials, it's important to also give them

# categories. This makes it easy for model recipients to do things

# like "show me everything made out of aluminium / concrete / steel

# / glass / etc". The IFC specification states a list of categories

# you can use.

aluminium = ifcopenshell.api.material.add_material(model, name="AL01", category="aluminium")
glass = ifcopenshell.api.material.add_material(model, name="GLZ01", category="glass")

# Now let's use those materials as two constituents in our set.

ifcopenshell.api.material.add_constituent(model,
constituent_set=material_set, material=aluminium)
ifcopenshell.api.material.add_constituent(model,
constituent_set=material_set, material=glass)

# Great! Let's assign our material set to our window type.

# We're technically not done here, we might want to add geometry to

# our window too, but to keep this example simple, geometry is

# optional and it is enough to say that this window is made out of

# aluminium and glass.

ifcopenshell.api.material.assign_material(model, products=[window_type], material=material_set)
ifcopenshell.api.material.add_layer(file: ifcopenshell.file, layer_set: ifcopenshell.entity_instance, material: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Adds a new layer to a layer set

A layer represents a portion of material within a layered build up, defined by a thickness. Typical layered construction includes walls and slabs, where a wall might include a layer of finish, a layer of structure, a layer of insulation, and so on. It is recommended to define layered construction this way where it is unnecessary to define the exact geometry of how the wall or slab will be built, and it will instead be determined on site by a trade.

Layers are defined in a particular order and thickness, so that it is clear which layer comes next.

Parameters:
layer_set (ifcopenshell.entity_instance) – The IfcMaterialLayerSet that the layer is part of. The layer set represents a group of layers. See ifcopenshell.api.material.add_material_set for more information on how to add a layer set.

material (ifcopenshell.entity_instance) – The IfcMaterial that the layer is made out of.

Returns:
The newly created IfcMaterialLayer

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we have a wall type that has two layers of

# gypsum with steel studs inside. Notice we are assigning to

# the type only, as all occurrences of that type will automatically

# inherit the material.

wall_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWallType", name="WAL01")

# First, let's create a material set. This will later be assigned

# to our wall type element.

material_set = ifcopenshell.api.material.add_material_set(model,
name="GYP-ST-GYP", set_type="IfcMaterialLayerSet")

# Let's create a few materials, it's important to also give them

# categories. This makes it easy for model recipients to do things

# like "show me everything made out of aluminium / concrete / steel

# / glass / etc". The IFC specification states a list of categories

# you can use.

gypsum = ifcopenshell.api.material.add_material(model, name="PB01", category="gypsum")
steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Now let's use those materials as three layers in our set, such

# that the steel studs are sandwiched by the gypsum. Let's imagine

# we're setting the layer thickness in millimeters.

layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 13})
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=steel)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 92})
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 13})

# Great! Let's assign our material set to our wall type.

ifcopenshell.api.material.assign_material(model, products=[wall_type], material=material_set)
ifcopenshell.api.material.add_list_item(file: ifcopenshell.file, material_list: ifcopenshell.entity_instance, material: ifcopenshell.entity_instance) → None
Adds a new material in a list of materials

In IFC2X3, if you wanted an object to have multiple materials (i.e. a composite material) you would assign the object to a material list, which would contain a list of materials. For example, a window might have a list of 2 materials, one being aluminium for the frame, and another being glass for the panel.

In IFC4 and above, this is deprecated and should not be used. Instead, you should use constituent sets instead, which achieve the same thing but are more powerful as they allow you to define the properties of the constituents too.

However if you’re stuck on IFC2X3, you have my condolences as well as this function.

Parameters:
material_list (ifcopenshell.entity_instance) – The IfcMaterialList the material should be added to.

material (ifcopenshell.entity_instance) – The IfcMaterial to add to the list

Returns:
None

Return type:
None

Example:

# Let's imagine we have a window type that has an aluminium frame

# and a glass glazing panel. Notice we are assigning to the type

# only, as all occurrences of that type will automatically inherit

# the material.

window_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWindowType")

# First, let's create a list. This will later be assigned to our

# window element.

material_set = ifcopenshell.api.material.add_material_set(model,
name="Window", set_type="IfcMaterialList")

# Let's create a few materials, it's important to also give them

# categories. This makes it easy for model recipients to do things

# like "show me everything made out of aluminium / concrete / steel

# / glass / etc". The IFC specification states a list of categories

# you can use.

aluminium = ifcopenshell.api.material.add_material(model, name="AL01", category="aluminium")
glass = ifcopenshell.api.material.add_material(model, name="GLZ01", category="glass")

# Now let's use those materials as two items in our list.

ifcopenshell.api.material.add_list_item(model, material_list=material_set, material=aluminium)
ifcopenshell.api.material.add_list_item(model, material_list=material_set, material=glass)

# Great! Let's assign our material set to our window type.

# We're technically not done here, we might want to add geometry to

# our window too, but to keep this example simple, geometry is

# optional and it is enough to say that this window is made out of

# aluminium and glass.

ifcopenshell.api.material.assign_material(model, products=[window_type], material=material_set)
ifcopenshell.api.material.add_material(file: ifcopenshell.file, name: str | None = None, category: str | None = None, description: str | None = None) → ifcopenshell.entity_instance
Adds a new material

A material in IFC represents a physical material, such as timber, steel, concrete, aluminium, etc. It may also contain physical properties used for structural or lighting simulation. Note that unlike the computer graphics industry, a material by itself does not define any colour or lighting information. Colours in IFC are known as “styles”, and an IFC material may or may not have any style information associated with it. See ifcopenshell.api.style for more information.

A material is typically given a code name which is used by architects in elevations and details when tagging finishes. Materials are also useful to structural engineers in specifying the exact types of concrete and steel to be used in structural simulations.

In addition, materials can belong to a category. Specifying this category is critical to allow model recipients to make simple queries like “show me all concrete / steel” elements in the model. Without standardised category naming of all materials, this type of query becomes a bespoke and inefficient task. A list of categories are: ‘concrete’, ‘steel’, ‘aluminium’, ‘block’, ‘brick’, ‘stone’, ‘wood’, ‘glass’, ‘gypsum’, ‘plastic’, and ‘earth’. The user is allowed to specify their own category instead if none of these categories are appropriate.

Note that categories are not available in IFC2X3. This shortcoming is one of the big reasons projects should upgrade to IFC4.

Additionally, a material’s description provides more information beyond its name or category.

Parameters:
name (str, optional) – The name of the material, typically tagged in a finishes drawing or schedule.

category (str, optional) – The category of the material.

description (str, optional) – A description of the material.

Returns:
The newly created IfcMaterial

Return type:
ifcopenshell.entity_instance

Example:

# Let's create two materials with their respective categories

concrete = ifcopenshell.api.material.add_material(model, name="CON01", category="concrete", description="Garage Slab")
steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel", description="Corten Steel")

# Let's imagine an urban concrete bench which is purely made out of concrete

concrete_bench = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurnitureType")

# Assign the concrete material to that bench. Note that no colour

# "Style" has been specified.

ifcopenshell.api.material.assign_material(model, products=[concrete_bench], material=concrete)
ifcopenshell.api.material.add_material_set(file: ifcopenshell.file, name: str = 'Unnamed', set_type: MATERIAL_SET_TYPE = 'IfcMaterialConstituentSet') → ifcopenshell.entity_instance
Adds a new material set

IFC allows you to state that objects are made out of multiple materials. These are known generically as material sets, but may also be called layered materials, composite materials, or other names in software.

There are three types of material sets:

A layer set, used for layered construction such as walls, where the element is parametrically made out of extruded layers, each layer having a thickness defined. Even though this is known as a layer “set” it is still recommended to use it for all standared layered construction as it describes the intent of the element to be layered construction and thus can be used for parametric editing.

A profile set, used for profiled construction such as beams or columns, where the element is parametrically made out of one or more extruded profiles, where each profile may be parametric from a standard section (e.g. standardised steel profile) or an arbitrary shape (e.g. cold rolled sections, or skirtings, moldings, etc). Note that even though this is called a profile “set”, it should still be used even if there is only a single profile. This is not available in IFC2X3.

A constituent set, used for arbitrary composite construction where the object is made out of multiple materials. The constituents may be explicitly defined via a shape, such as a window where the frame geometry is made from one material and the panel geometry is made from another material. Alternatively, the constituents may be represented in terms of percentages, such as in mixtures like concrete where there might be a percentage constituent of cement and another percentage constituent of binder. This is not available in IFC2X3.

There is also a fourth material set known as a material list, which is a legacy type of set used by IFC2X3. It should not be used on IFC4 and above, and constituent sets should be used instead.

Parameters:
name (str, optional) – The name of the material set, which may be purely descriptive or annotated in drawings. Defaults to “Unnamed”.

set_type (str, optional) – What type of set you want to create, chosen from IfcMaterialLayerSet, IfcMaterialProfileSet, IfcMaterialConstituentSet, or IfcMaterialList. Defaults to IfcMaterialConstituentSet.

Returns:
The newly created material set element

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we have a wall type that has two layers of

# gypsum with steel studs inside. Notice we are assigning to

# the type only, as all occurrences of that type will automatically

# inherit the material.

wall_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWallType", name="WAL01")

# First, let's create a material set. This will later be assigned

# to our wall type element.

material_set = ifcopenshell.api.material.add_material_set(model,
name="GYP-ST-GYP", set_type="IfcMaterialLayerSet")

# Let's create a few materials, it's important to also give them

# categories. This makes it easy for model recipients to do things

# like "show me everything made out of aluminium / concrete / steel

# / glass / etc". The IFC specification states a list of categories

# you can use.

gypsum = ifcopenshell.api.material.add_material(model, name="PB01", category="gypsum")
steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Now let's use those materials as three layers in our set, such

# that the steel studs are sandwiched by the gypsum. Let's imagine

# we're setting the layer thickness in millimeters.

layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 13})
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=steel)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 92})
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 13})

# Great! Let's assign our material set to our wall type.

ifcopenshell.api.material.assign_material(model, products=[wall_type], material=material_set)
ifcopenshell.api.material.add_profile(file: ifcopenshell.file, profile_set: ifcopenshell.entity_instance, material: ifcopenshell.entity_instance | None = None, profile: ifcopenshell.entity_instance | None = None) → ifcopenshell.entity_instance
Add a new profile item to a profile set

A profile item in a profile set represents an extruded 2D profile curve that is extruded along the axis of the element. Most commonly there will only be a single profile item in a profile set. For example, a beam will have a material profile set containing a single profile item, which may have a steel material and a I-beam shaped profile curve.

Note that the “profile item” represents a single extrusion in the profile set, whereas the “profile curve” represents a 2D curve used by a “profile item”.

In some cases, a profiled element (i.e. beam, column) may be a composite beam or column and include multiple extrusions. This is rare. The order of the profiles does not matter.

Parameters:
profile_set (ifcopenshell.entity_instance) – The IfcMaterialProfileSet that the profile is part of. The profile set represents a group of profile items. See ifcopenshell.api.material.add_material_set for more information on how to add a profile set.

material (ifcopenshell.entity_instance, optional) – The IfcMaterial that the profile item is made out of.

profile (ifcopenshell.entity_instance, optional) – The IfcProfileDef that represents the 2D cross section of the the profile item.

Returns:
The newly created IfcMaterialProfile

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we have a steel I-beam. Notice we are assigning to

# the type only, as all occurrences of that type will automatically

# inherit the material.

beam_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBeamType", name="B1")

# First, let's create a material set. This will later be assigned

# to our beam type element.

material_set = ifcopenshell.api.material.add_profile_set(model,
name="B1", set_type="IfcMaterialProfileSet")

# Create a steel material.

steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Create an I-beam profile curve. Notice how we name our profiles

# based on standardised steel profile names.

hea100 = file.create_entity(
"IfcIShapeProfileDef", ProfileName="HEA100", ProfileType="AREA",
OverallWidth=100, OverallDepth=96, WebThickness=5, FlangeThickness=8, FilletRadius=12,
)

# Define that steel material and cross section as a single profile

# item. If this were a composite beam, we might add multiple profile

# items instead, but this is rarely the case in most construction.

ifcopenshell.api.material.add_profile(model,
profile_set=material_set, material=steel, profile=hea100)

# Great! Let's assign our material set to our beam type.

ifcopenshell.api.material.assign_material(model, products=[beam_type], material=material_set)
ifcopenshell.api.material.assign_material(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], type: ifcopenshell.util.element.MATERIAL_TYPE = 'IfcMaterial', material: ifcopenshell.entity_instance | None = None) → ifcopenshell.entity_instance | list[ifcopenshell.entity_instance] | None
Assigns a material to the list of products

Will unassign previously assigned material.

When a material is assigned to a product, it means that the product is made out of that material. In its simplest form, a single material may be assigned to a product, meaning that the entire product is made out of that one material. Alternatively, a material set may be assigned to a product, meaning that the product is made out of a set of materials. There are three types of sets, including layered construction, profiled materials, and arbitrary material constituents. See ifcopenshell.api.material.add_material_set for details.

Materials are typically assigned to the element types rather than individual occurrences of elements. Individual occurrences would then inherit the material from the type.

If the type has a material set, then the geometry of the occurrences must comply with the material set. For example, if the type has a constituent set, then it is expected that all occurrences also inherit the geometry of the type, which is made out of those constituents. Alternatively, if the type has a layer set, then all occurrences must have geometry that has a thickness equal to the sum of all layers. If a type has a profile set, then all occurrences must has the same profile extruded along its axis.

For layers and profiles assigned to types, the occurrences must be assigned an IfcMaterialLayerSetUsage or an IfcMaterialProfileSetUsage. This allows individual occurrences to override the layered or profiled construction offset from a reference line.

Parameters:
products (list[ifcopenshell.entity_instance]) – The list of IfcProducts to assign the material or material set to.

type (str) – Choose from “IfcMaterial”, “IfcMaterialConstituentSet”, “IfcMaterialLayerSet”, “IfcMaterialLayerSetUsage”, “IfcMaterialProfileSet”, “IfcMaterialProfileSetUsage”, or “IfcMaterialList”. Note that “Set Usages” may only be assigned to occurrences, not types. Defaults to “IfcMaterial”.

material (ifcopenshell.entity_instance, optional) – The IfcMaterial or material set you are assigning here. If type is Usage then no need to provide material, it will be deduced from the element type automatically. If IfcMaterial is provided as material and type is not IfcMaterial, provided material will be ignored except for IfcMaterialList where it will be used as part of the list.

Returns:
IfcRelAssociatesMaterial entity or a list of IfcRelAssociatesMaterial entities (possible if type is Usage and products require different Usages) or None if products was empty list.

Return type:
Union[ ifcopenshell.entity_instance, list[ifcopenshell.entity_instance], None]

Example:

# Let's start with a simple concrete material

concrete = ifcopenshell.api.material.add_material(model, name="CON01", category="concrete")

# Let's imagine a concrete bench made out of a single concrete

# material. Let's assign it to the type.

bench_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurnitureType")
ifcopenshell.api.material.assign_material(model,
products=[bench_type], type="IfcMaterial", material=concrete)

# Let's imagine there are a two occurrences of this bench. It's not

# necessary to assign any material to these benches as they

# automatically inherit the material from the type.

bench1 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")
bench2 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")
ifcopenshell.api.type.assign_type(model, related_objects=[bench1], relating_type=bench_type)
ifcopenshell.api.type.assign_type(model, related_objects=[bench2], relating_type=bench_type)

# If we have a concrete wall, we should use a layer set. Again,

# let's start with a wall type, not occurrences.

wall_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWallType", name="WAL01")

# Even though there is only one layer in our layer set, we still use

# a layer set because it makes it clear that this is a layered

# construction. Let's say it's a 200mm thick concrete layer.

material_set = ifcopenshell.api.material.add_material_set(model,
name="CON200", set_type="IfcMaterialLayerSet")
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=steel)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 200})

# Our wall type now has the layer set assigned to it

ifcopenshell.api.material.assign_material(model,
products=[wall_type], type="IfcMaterialLayerSet", material=material_set)

# Let's imagine an occurrence of this wall type.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
ifcopenshell.api.type.assign_type(model, related_objects=[wall], relating_type=wall_type)

# Our wall occurrence needs to have a "set usage" which describes

# how the layers relate to a reference line (typically a 2D line

# representing the extents of the wall). Usages are special since

# they automatically detect the inherited material set from the

# type. You'd write similar code for a profile set.

ifcopenshell.api.material.assign_material(model,
products=[wall], type="IfcMaterialLayerSetUsage")

# To be complete, let's create the wall's axis and body

# representation. Notice how the axis guides the walls "reference

# line" which determines where layers are extruded from, and the

# body has a thickness of 200mm, same as our total layer set

# thickness.

axis = ifcopenshell.api.geometry.add_axis_representation(model,
context=axis_context, axis=[(0.0, 0.0), (5000.0, 0.0)])
body = ifcopenshell.api.geometry.add_wall_representation(model,
context=body_context, length=5000, height=3000, thickness=200)
ifcopenshell.api.geometry.assign_representation(model, product=wall, representation=axis)
ifcopenshell.api.geometry.assign_representation(model, product=wall, representation=body)
ifcopenshell.api.geometry.edit_object_placement(model, product=wall)
ifcopenshell.api.material.assign_profile(file: ifcopenshell.file, material_profile: ifcopenshell.entity_instance, profile: ifcopenshell.entity_instance) → None
Changes the profile curve of a material profile item in a profile set

In addition to changing the profile curve, it will also change the profile curve used in any body representation extrusions.

Parameters:
material_profile (ifcopenshell.entity_instance) – The IfcMaterialProfile to change the profile curve of. See ifcopenshell.api.material.add_profile to see how to create profiles.

profile (ifcopenshell.entity_instance) – The IfcProfileDef to set the profile item’s curve to.

Returns:
None

Return type:
None

Example:

# Let's imagine we have a steel I-beam. Notice we are assigning to

# the type only, as all occurrences of that type will automatically

# inherit the material.

beam_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBeamType", name="B1")

# First, let's create a material set. This will later be assigned

# to our beam type element.

material_set = ifcopenshell.api.material.add_profile_set(model,
name="B1", set_type="IfcMaterialProfileSet")

# Create a steel material.

steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Create an I-beam profile curve. Notice how we name our profiles

# based on standardised steel profile names.

hea100 = usecase.file.create_entity(
"IfcIShapeProfileDef", ProfileName="HEA100", ProfileType="AREA",
OverallWidth=100, OverallDepth=96, WebThickness=5, FlangeThickness=8, FilletRadius=12,
)

# Define that steel material and cross section as a single profile

# item. If this were a composite beam, we might add multiple profile

# items instead, but this is rarely the case in most construction.

profile_item = ifcopenshell.api.material.add_profile(model,
profile_set=material_set, material=steel, profile=hea100)

# Great! Let's assign our material set to our beam type.

ifcopenshell.api.material.assign_material(model, products=[beam_type], material=material_set)

# Let's create an occurrence of this beam.

beam = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBeam", name="B1.01")
ifcopenshell.api.material.assign_material(model,
products=[beam], type="IfcMaterialProfileSetUsage")

# Let's give a 1000mm long beam body representation.

body = ifcopenshell.api.geometry.add_profile_representation(
context=body_context, profile=hea100, depth=1000)
ifcopenshell.api.geometry.assign_representation(model, product=beam, representation=body)
ifcopenshell.api.geometry.edit_object_placement(model, product=beam)

# Now let's change the profile to a HEA200 standard profile instead.

# This will automatically change the body representation that we

# just added as well to a HEA200 profile.

hea200 = usecase.file.create_entity(
"IfcIShapeProfileDef", ProfileName="HEA200", ProfileType="AREA",
OverallWidth=200, OverallDepth=190, WebThickness=6.5, FlangeThickness=10, FilletRadius=18,
)
ifcopenshell.api.material.assign_profile(model, material_profile=profile_item, profile=hea200)
ifcopenshell.api.material.copy_material(file: ifcopenshell.file, material: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Copies a material or material set

All material psets and styles are copied. The copied material is not associated to any elements.

If a material set is copied, the set items are also copied. However the underlying materials (and profiles) used within the set items are reused.

If a material is associated with a presentation style, that presentation style is reused.

Parameters:
material (ifcopenshell.entity_instance) – The IfcMaterialDefinition to copy

Returns:
The new copy of the material

Return type:
ifcopenshell.entity_instance

Example:

concrete = ifcopenshell.api.material.add_material(model, name="CON01", category="concrete")

# Let's duplicate the concrete material

concrete_copy = ifcopenshell.api.material.copy_material(model, material=concrete)
ifcopenshell.api.material.edit_assigned_material(file: ifcopenshell.file, element: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcMaterial

For more information about the attributes and data types of an IfcMaterial, consult the IFC documentation.

Parameters:
element (ifcopenshell.entity_instance) – The IfcMaterial entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

concrete = ifcopenshell.api.material.add_material(model, name="CON01", category="concrete")
ifcopenshell.api.material.edit_assigned_material(model,
element=concrete, attributes={"Description": "40MPA concrete with broom finish"})
ifcopenshell.api.material.edit_constituent(file: ifcopenshell.file, constituent: ifcopenshell.entity_instance, attributes: dict[str, Any] | None = None, material: ifcopenshell.entity_instance | None = None) → None
Edits the attributes of an IfcMaterialConstituent

For more information about the attributes and data types of an IfcMaterialConstituent, consult the IFC documentation.

Parameters:
constituent (ifcopenshell.entity_instance) – The IfcMaterialConstituent entity you want to edit

attributes (dict, optional) – a dictionary of attribute names and values.

material (ifcopenshell.entity_instance, optional) – The IfcMaterial entity you want to change the constituent to

Returns:
None

Return type:
None

Example:

# Let's add two materials

aluminium1 = ifcopenshell.api.material.add_material(model, name="AL01", category="aluminium")
aluminium2 = ifcopenshell.api.material.add_material(model, name="AL02", category="aluminium")
glass = ifcopenshell.api.material.add_material(model, name="GLZ01", category="glass")

material_set = ifcopenshell.api.material.add_material_set(model,
name="Window", set_type="IfcMaterialConstituentSet")

# Set up two constituents, one for the frame and the other for the glazing.

framing = ifcopenshell.api.material.add_constituent(model,
constituent_set=material_set, material=aluminium1)
glazing = ifcopenshell.api.material.add_constituent(model,
constituent_set=material_set, material=glass)

# Let's make sure this constituent refers to the framing of the

# window and uses the second aluminium material instead.

ifcopenshell.api.material.edit_constituent(model,
constituent=framing, attributes={"Name": "Framing"}, material=aluminium2)

ifcopenshell.api.material.edit_constituent(model,
constituent=constituent, attributes={"Name": "Glazing"})
ifcopenshell.api.material.edit_layer(file: ifcopenshell.file, layer: ifcopenshell.entity_instance, attributes: dict[str, Any] | None = None, material: ifcopenshell.entity_instance | None = None) → None
Edits the attributes of an IfcMaterialLayer

For more information about the attributes and data types of an IfcMaterialLayer, consult the IFC documentation.

Parameters:
layer (ifcopenshell.entity_instance) – The IfcMaterialLayer entity you want to edit

attributes (dict, optional) – a dictionary of attribute names and values.

material (ifcopenshell.entity_instance, optional) – The IfcMaterial entity you want the layer to be made from.

Returns:
None

Return type:
None

Example:

# Let's create two materials typically used for steel stud partition

# walls with gypsum lining.

gypsum = ifcopenshell.api.material.add_material(model, name="PB01", category="gypsum")
steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Create a material layer set to contain our layers.

material_set = ifcopenshell.api.material.add_material_set(model,
name="GYP-ST-GYP", set_type="IfcMaterialLayerSet")

# Now let's use those materials as three layers in our set, such

# that the steel studs are sandwiched by the gypsum. Let's imagine

# we're setting the layer thickness in millimeters.

layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 13})
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=steel)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 92})
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 13})
ifcopenshell.api.material.edit_layer_usage(file: ifcopenshell.file, usage: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcMaterialLayerSetUsage

This is typically used to change the offset from the reference line to the layers.

For more information about the attributes and data types of an IfcMaterialLayerSetUsage, consult the IFC documentation.

Parameters:
usage (ifcopenshell.entity_instance) – The IfcMaterialLayerSetUsage entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Let's start with a simple concrete material

concrete = ifcopenshell.api.material.add_material(model, name="CON01", category="concrete")

# If we have a concrete wall, we should use a layer set. Again,

# let's start with a wall type, not occurrences.

wall_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWallType", name="WAL01")

# Even though there is only one layer in our layer set, we still use

# a layer set because it makes it clear that this is a layered

# construction. Let's say it's a 200mm thick concrete layer.

material_set = ifcopenshell.api.material.add_material_set(model,
name="CON200", set_type="IfcMaterialLayerSet")
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=steel)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": 200})

# Our wall type now has the layer set assigned to it

ifcopenshell.api.material.assign_material(model,
products=[wall_type], type="IfcMaterialLayerSet", material=material_set)

# Let's imagine an occurrence of this wall type.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
ifcopenshell.api.type.assign_type(model, related_objects=[wall], relating_type=wall_type)

# Our wall occurrence needs to have a "set usage" which describes

# how the layers relate to a reference line (typically a 2D line

# representing the extents of the wall). Usages are special since

# they automatically detect the inherited material set from the

# type. You'd write similar code for a profile set.

rel = ifcopenshell.api.material.assign_material(model,
products=[wall], type="IfcMaterialLayerSetUsage")

# Let's change the offset from the reference line to be 200mm

# instead of the default of 0mm.

ifcopenshell.api.material.edit_layer_usage(model,
usage=rel.RelatingMaterial, attributes={"OffsetFromReferenceLine": 200})
ifcopenshell.api.material.edit_material(file: ifcopenshell.file, material: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcMaterial

ifcopenshell.api.material.edit_profile(file: ifcopenshell.file, profile: ifcopenshell.entity_instance, attributes: dict[str, Any] | None = None, profile_def: ifcopenshell.entity_instance | None = None, material: ifcopenshell.entity_instance | None = None) → None
Edits the attributes of an IfcMaterialProfile

For more information about the attributes and data types of an IfcMaterialProfile, consult the IFC documentation.

Parameters:
profile (ifcopenshell.entity_instance) – The IfcMaterialProfile entity you want to edit

attributes (dict, optional) – a dictionary of attribute names and values.

profile_def (ifcopenshell.entity_instance, optional) – The IfcProfileDef entity the profile curve should be extruded from.

material (ifcopenshell.entity_instance, optional) – The IfcMaterial entity you want to change the profile to be made from.

Returns:
None

Return type:
None

Example:

# Let's create a material set to store our profiles.

material_set = ifcopenshell.api.material.add_profile_set(model,
name="B1", set_type="IfcMaterialProfileSet")

# Create a couple steel materials.

steel1 = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")
steel2 = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Create some I-shaped profiles. Notice how we name our profiles based

# on standardised steel profile names.

hea100 = file.create_entity(
"IfcIShapeProfileDef", ProfileName="HEA100", ProfileType="AREA",
OverallWidth=100, OverallDepth=96, WebThickness=5, FlangeThickness=8, FilletRadius=12,
)
hea200 = file.create_entity(
"IfcIShapeProfileDef", ProfileName="HEA200", ProfileType="AREA",
OverallWidth=200, OverallDepth=190, WebThickness=6.5, FlangeThickness=10, FilletRadius=18,
)

# Define that steel material and cross section as a single profile

# item. If this were a composite beam, we might add multiple profile

# items instead, but this is rarely the case in most construction.

profile_item = ifcopenshell.api.material.add_profile(model,
profile_set=material_set, material=steel1, profile=hea100)

# Edit our profile item to use a HEA200 profile instead made out of

# another type of steel.

ifcopenshell.api.material.edit_profile(model,
profile=profile_item, profile_def=hea200, material=steel2)
ifcopenshell.api.material.edit_profile_usage(file: ifcopenshell.file, usage: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcMaterialProfileSetUsage

This is typically used to change the cardinal point of the profile. The cardinal point represents whether the profile is extruded along the center of the axis line, at a corner, at a shear center, at the bottom, top, etc.

For more information about the attributes and data types of an IfcMaterialProfileSetUsage, consult the IFC documentation.

Parameters:
usage (ifcopenshell.entity_instance) – The IfcMaterialProfileSetUsage entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Let's imagine we have a steel I-beam. Notice we are assigning to

# the type only, as all occurrences of that type will automatically

# inherit the material.

beam_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBeamType", name="B1")

# First, let's create a material set. This will later be assigned

# to our beam type element.

material_set = ifcopenshell.api.material.add_profile_set(model,
name="B1", set_type="IfcMaterialProfileSet")

# Create a steel material.

steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Create an I-beam profile curve. Notice how we name our profiles

# based on standardised steel profile names.

hea100 = usecase.file.create_entity(
"IfcIShapeProfileDef", ProfileName="HEA100", ProfileType="AREA",
OverallWidth=100, OverallDepth=96, WebThickness=5, FlangeThickness=8, FilletRadius=12,
)

# Define that steel material and cross section as a single profile

# item. If this were a composite beam, we might add multiple profile

# items instead, but this is rarely the case in most construction.

profile_item = ifcopenshell.api.material.add_profile(model,
profile_set=material_set, material=steel, profile=hea100)

# Great! Let's assign our material set to our beam type.

ifcopenshell.api.material.assign_material(model, products=[beam_type], material=material_set)

# Let's create an occurrence of this beam.

beam = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBeam", name="B1.01")
rel = ifcopenshell.api.material.assign_material(model,
products=[beam], type="IfcMaterialProfileSetUsage")

# Let's give a 1000mm long beam body representation.

body = ifcopenshell.api.geometry.add_profile_representation(
context=body_context, profile=hea100, depth=1000)
ifcopenshell.api.geometry.assign_representation(model, product=beam, representation=body)
ifcopenshell.api.geometry.edit_object_placement(model, product=beam)

# Let's change the cardinal point to be the top center of the axis

# line. This is represented by the number "8". Consult the IFC

# documentation for all the numbers you can use.

ifcopenshell.api.material.edit_profile_usage(model,
usage=rel.RelatingMaterial, attributes={"CardinalPoint": 8})
ifcopenshell.api.material.remove_constituent(file: ifcopenshell.file, constituent: ifcopenshell.entity_instance) → None
Removes a constituent from a constituent set

Note that it is invalid to have zero items in a set, so you should leave at least one constituent to ensure a valid IFC dataset.

Parameters:
constituent (ifcopenshell.entity_instance) – The IfcMaterialConstituent entity you want to remove

Returns:
None

Return type:
None

Example:

# Create a material set for windows made out of aluminium and glass.

material_set = ifcopenshell.api.material.add_material_set(model,
name="Window", set_type="IfcMaterialConstituentSet")

aluminium = ifcopenshell.api.material.add_material(model, name="AL01", category="aluminium")
glass = ifcopenshell.api.material.add_material(model, name="GLZ01", category="glass")

# Now let's use those materials as two constituents in our set.

framing = ifcopenshell.api.material.add_constituent(model,
constituent_set=material_set, material=aluminium)
glazing = ifcopenshell.api.material.add_constituent(model,
constituent_set=material_set, material=glass)

# Let's remove the glass constituent. Note that we should not remove

# the framing, at this would mean there are no constituents which is

# invalid.

ifcopenshell.api.material.remove_constituent(model, constituent=glazing)
ifcopenshell.api.material.remove_layer(file: ifcopenshell.file, layer: ifcopenshell.entity_instance) → None
Removes a layer from a layer set

Note that it is invalid to have zero items in a set, so you should leave at least one layer to ensure a valid IFC dataset.

Parameters:
layer (ifcopenshell.entity_instance) – The IfcMaterialLayer entity you want to remove

Returns:
None

Return type:
None

Example:

# Create a material set for steel stud partition walls.

material_set = ifcopenshell.api.material.add_material_set(model,
name="Window", set_type="IfcMaterialConstituentSet")

gypsum = ifcopenshell.api.material.add_material(model, name="PB01", category="gypsum")
steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Now let's use those materials as three layers in our set, such

# that the steel studs are sandwiched by the gypsum. Let's imagine

# we're setting the layer thickness in millimeters.

layer1 = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer1, attributes={"LayerThickness": 13})
layer2 = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=steel)
ifcopenshell.api.material.edit_layer(model, layer=layer2, attributes={"LayerThickness": 92})
layer3 = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer3, attributes={"LayerThickness": 13})

# Let's remove the last layer, such that the wall might be clad only

# one one side such as to line a services riser.

ifcopenshell.api.material.remove_layer(model, layer=layer3)
ifcopenshell.api.material.remove_list_item(file: ifcopenshell.file, material_list: ifcopenshell.entity_instance, material_index: int = 0) → None
Removes an item in an material list

Note that it is invalid to have zero items in a list, so you should leave at least one item to ensure a valid IFC dataset.

Parameters:
material_list (ifcopenshell.entity_instance) – The IfcMaterialList entity you want to remove an item from.

material_index (int, optional) – The index of the material you want to remove from the list. Starts counting at 0. Defaults to 0.

Returns:
None

Return type:
None

Example:

# Create a material list for aluminium windows.

material_set = ifcopenshell.api.material.add_material_set(model,
name="Window", set_type="IfcMaterialMaterialList")

aluminium = ifcopenshell.api.material.add_material(model, name="AL01", category="aluminium")
glass = ifcopenshell.api.material.add_material(model, name="GLZ01", category="glass")

# Now let's use those materials as two items in our list.

ifcopenshell.api.material.add_list_item(model, material_list=material_set, material=aluminium)
ifcopenshell.api.material.add_list_item(model, material_list=material_set, material=glass)

# Let's remove the glass

ifcopenshell.api.material.remove_list_item(model, material_list=material_set, material_index=1)
ifcopenshell.api.material.remove_material(file: ifcopenshell.file, material: ifcopenshell.entity_instance) → None
Removes a material

If the material is used in a material set, the corresponding layer, profile, or constituent is also removed. Note that this may result in a material set with zero items in it, which is invalid, so the user must take care of this situation themselves.

Parameters:
material (ifcopenshell.entity_instance) – The IfcMaterial entity you want to remove

Returns:
None

Return type:
None

Example:

# Create a material

aluminium = ifcopenshell.api.material.add_material(model, name="AL01", category="aluminium")

# ... and remove it

ifcopenshell.api.material.remove_material(model, material=aluminium)
ifcopenshell.api.material.remove_material_set(file: ifcopenshell.file, material: ifcopenshell.entity_instance) → None
Removes a material set

All set items, such as layers, profiles, or constituents will also be removed. However, the materials and profile curves used by the layers, profiles and constituents will not be removed.

Parameters:
material (ifcopenshell.entity_instance) – The IfcMaterialLayerSet, IfcMaterialConstituentSet, IfcMaterialProfileSet entity you want to remove.

Returns:
None

Return type:
None

Example:

# Create a material set

material_set = ifcopenshell.api.material.add_material_set(model,
name="GYP-ST-GYP", set_type="IfcMaterialLayerSet")

# Create some materials

gypsum = ifcopenshell.api.material.add_material(model, name="PB01", category="gypsum")
steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Add some layers

layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=steel)
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)

# Completely delete the set and all layers. The gypsum and steel

# material still exist, though.

ifcopenshell.api.material.remove_material_set(model, material=material_set)
ifcopenshell.api.material.remove_profile(file: ifcopenshell.file, profile: ifcopenshell.entity_instance) → None
Removes a profile item from a profile set

Note that it is invalid to have zero items in a set, so you should leave at least one profile to ensure a valid IFC dataset.

Parameters:
profile (ifcopenshell.entity_instance) – The IfcMaterialProfile entity you want to remove

Returns:
None

Return type:
None

Example:

# First, let's create a material set.

material_set = ifcopenshell.api.material.add_profile_set(model,
name="B1", set_type="IfcMaterialProfileSet")

# Create a steel material.

steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Create an I-beam profile curve. Notice how we name our profiles

# based on standardised steel profile names.

hea100 = file.create_entity(
"IfcIShapeProfileDef", ProfileName="HEA100", ProfileType="AREA",
OverallWidth=100, OverallDepth=96, WebThickness=5, FlangeThickness=8, FilletRadius=12,
)

# Define that steel material and cross section as a single profile item.

ifcopenshell.api.material.add_profile(model,
profile_set=material_set, material=steel, profile=hea100)

# Imagine a welded square along the length of the profile.

welded_square = ifcopenshell.api.profile.add_arbitrary_profile(model,
profile=[(.0025, .0025), (.0325, .0025), (.0325, -.0025), (.0025, -.0025), (.0025, .0025)])
weld_profile = ifcopenshell.api.material.add_profile(model,
profile_set=material_set, material=steel, profile=welded_square)

# Let's remove our welded square.

ifcopenshell.api.material.remove_profile(model, profile=weld_profile)
ifcopenshell.api.material.reorder_set_item(file: ifcopenshell.file, material_set: ifcopenshell.entity_instance, old_index: int = 0, new_index: int = 0) → None
Reorders an item in a material set

In some material sets, the order have meaning, like in a layer set. In other cases, it is purely for human convenience.

Parameters:
material_set (ifcopenshell.entity_instance) – The IfcMaterialSet which you want to reorder an item in.

old_index (int) – The index of the item you want to move. This starts counting from 0.

new_index (int) – The index of the new position the item will move to. This starts counting from 0.

Returns:
None

Return type:
None

Example:

material_set = ifcopenshell.api.material.add_material_set(model,
name="Window", set_type="IfcMaterialList")

aluminium = ifcopenshell.api.material.add_material(model, name="AL01", category="aluminium")
glass = ifcopenshell.api.material.add_material(model, name="GLZ01", category="glass")

# Now let's use those materials as two items in our list.

ifcopenshell.api.material.add_list_item(model, material_list=material_set, material=aluminium)
ifcopenshell.api.material.add_list_item(model, material_list=material_set, material=glass)

# Switch the order around, this has no meaning for a list, so this

# is just for fun.

ifcopenshell.api.material.reorder_set_item(model,
material_set=material_set, old_index=0, new_index=1)
ifcopenshell.api.material.unassign_material(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance]) → None
Removes any material relationship with the list of products

A product can only have one material assigned to it, which is why it is not necessary to specify the material to unassign. The material is not removed, only the relationship is removed.

If the product does not have a material, nothing happens.

Parameters:
products – The list IfcProducts that may or may not have a material

Returns:
None

Return type:
None

Example:

concrete = ifcopenshell.api.material.add_material(model, name="CON01", category="concrete")

# Let's imagine a concrete bench made out of concrete.

bench_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurnitureType")
ifcopenshell.api.material.assign_material(model,
products=[bench_type], type="IfcMaterial", material=concrete)

# Let's change our mind and remove the concrete assignment. The

# concrete material still exists, but the bench is no longer made

# out of concrete now.

ifcopenshell.api.material.unassign_material(model, products=[bench_type])

ifcopenshell.api.nest
Nesting is when a component is attached to a host element

Examples include when a faucet is attached using a predrilled hole in a basin, or when a modular connection occurs through a connection point. This implies that when a host element moves, the child nested components must move as well.

Note that this API is not meant to be used for connection points on distribution systems. For that purpose, such as for pipe fittings and equipment, please see ifcopenshell.api.system.

Submodules
ifcopenshell.api.nest.assign_object
ifcopenshell.api.nest.change_nest
ifcopenshell.api.nest.reorder_nesting
ifcopenshell.api.nest.unassign_object
Package Contents
ifcopenshell.api.nest.assign_object(file: ifcopenshell.file, related_objects: list[ifcopenshell.entity_instance], relating_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Assigns objects as nested children to a parent host

All physical IFC model elements must be part of a hierarchical tree called the “spatial decomposition”, where large things are made up of smaller things. This tree always begins at an “IfcProject” and is then broken down using “decomposition” relationships, of which aggregation is the first relationship you will use.

Another type of “decomposition” relationship is known as “nesting”. Nesting is used when an child object is physically attached to a parent host object, through a physical predetermined connection point. The child object must be specifically designed to attach to a other objects at specific positions with a particular form factor. Examples include faucets which must always be attached through a predrilled hole in a basin. Alternatively, it could be a modular attachment with a correlating male and female joint that must join at a particular point. Because there is a strict connection point, when the parent moves, all nested children must move with the parent. Another example might be a predrilled hole in a door panel where hardware must fit through.

Nesting relationships are not very commonly used in most design and construction models. Its main usecase is in modular construction, kit of parts, or fabrication models.

As a product may only have a single location in the “spatial decomposition” tree, assigning an nesting relationship will remove any previous aggregation, containment, or nesting relationships it may have.

IFC placements follow a convention where the placement is relative to its parent in the spatial hierarchy. If your product has a placement, its placement will be recalculated to follow this convention.

For physical connections which are part of a distribution system, such as a plug connecting into a GPO, or a duct connecting to an AHU, or two pipe segments connecting with a bend, tee, or wye fitting, you should not nest the two objects directly. Instead, you should nest a connection port, which determines the type of compatible distribution flow that can be connected to it. To do this, do not use this function, but instead use the more specific functions in the ifcopenshell.api.system module.

Note that nesting relationships may also be used by non-physical elements, such as cost items or tasks. In this context, nesting means that there is an implied order to the child cost items or tasks (i.e. task 1 should be shown before task 2). It is not necessary to use this function for nesting non-physical elements. Instead, it is recommended to instead just use the relevant API functions, like ifcopenshell.api.cost.add_cost_item or ifcopenshell.api.sequence.add_task.

Parameters:
related_objects (list[ifcopenshell.entity_instance]) – The list of children of the nesting relationship, typically IfcElements.

relating_object (ifcopenshell.entity_instance) – The host parent of the nesting relationship, typically an IfcElement.

Returns:
The IfcRelNests relationship instance or None if related_objects was empty list.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

# Faucets are designed to attach onto a sink through a predrilled hole.

sink = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcSanitaryTerminal", predefined_type="SINK")
faucet = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcValve", predefined_type="FAUCET")
ifcopenshell.api.nest.assign_object(model, related_objects=[faucet], relating_object=sink)
ifcopenshell.api.nest.change_nest(file: ifcopenshell.file, item: ifcopenshell.entity_instance, new_parent: ifcopenshell.entity_instance) → None
Assigns a cost item to a new parent cost item

ifcopenshell.api.nest.reorder_nesting(file: ifcopenshell.file, item: ifcopenshell.entity_instance, old_index: int = 0, new_index: int = 0) → None
Reorders an item in a nesting set

ifcopenshell.api.nest.unassign_object(file: ifcopenshell.file, related_objects: list[ifcopenshell.entity_instance]) → None
Unassigns related_objects from their nests.

An object (the whole within a decomposition) is Nested by zero or one more smaller objects. This function will remove this nesting relationship.

If the object is not part of a nesting relationship, nothing will happen.

Parameters:
related_objects (list[ifcopenshell.entity_instance]) – The list of children of the nesting relationship, typically IfcElements.

Returns:
None

Return type:
None

Example:

task = ifcopenshell.api.root.create_entity(model, ifc_class="IfcTasks")
subtask1 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcTask")
subtask2 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcTask")
ifcopenshell.api.nest.assign_object(model, related_objects=[subtask1], relating_object=task)
ifcopenshell.api.nest.assign_object(model, related_objects=[subtask2], relating_object=task)

# nothing is returned

rel = ifcopenshell.api.nest.unassign_object(model, related_objects=[subtask1])

# nothing is returned, relationship is removed

ifcopenshell.api.nest.unassign_object(model, related_objects=[subtask2])

ifcopenshell.api.owner
An element may have an owner, indicating who is responsible, liable, or contactable regarding that element

Note that in IFC2X3, element ownership is mandatory and must be addressed prior to the creation of any element at all. See create_owner_history() for examples.

Submodules
ifcopenshell.api.owner.add_actor
ifcopenshell.api.owner.add_address
ifcopenshell.api.owner.add_application
ifcopenshell.api.owner.add_organisation
ifcopenshell.api.owner.add_person
ifcopenshell.api.owner.add_person_and_organisation
ifcopenshell.api.owner.add_role
ifcopenshell.api.owner.assign_actor
ifcopenshell.api.owner.create_owner_history
ifcopenshell.api.owner.edit_actor
ifcopenshell.api.owner.edit_address
ifcopenshell.api.owner.edit_organisation
ifcopenshell.api.owner.edit_person
ifcopenshell.api.owner.edit_role
ifcopenshell.api.owner.remove_actor
ifcopenshell.api.owner.remove_address
ifcopenshell.api.owner.remove_application
ifcopenshell.api.owner.remove_organisation
ifcopenshell.api.owner.remove_person
ifcopenshell.api.owner.remove_person_and_organisation
ifcopenshell.api.owner.remove_role
ifcopenshell.api.owner.settings
ifcopenshell.api.owner.unassign_actor
ifcopenshell.api.owner.update_owner_history
Package Contents
ifcopenshell.api.owner.add_actor(file: ifcopenshell.file, actor: ifcopenshell.entity_instance, ifc_class: ACTOR_TYPE = 'IfcActor') → ifcopenshell.entity_instance
Adds a new actor

An actor is a person or an organisation who has a responsibility or role to play in a project. Actor roles include design consultants, architects, engineers, cost planners, suppliers, manufacturers, warrantors, owners, subcontractors, etc.

Actors may either be project actors, who are responsible for the delivery of the project, or occupants, who are responsible for the consumption of the project.

Identifying and managing actors is critical for asset management, and identifying liability for legal submissions.

Parameters:
actor (ifcopenshell.entity_instance) – Most commonly, an IfcOrganization (in compliance with GDPR requirements for non personally identifiable information), or an IfcPerson if it is a sole individual, or an IfcPersonAndOrganization if a specific person is liable within an organisation and must be legally nominated.

ifc_class (str, optional) – Either “IfcActor” or “IfcOccupant”.

Returns:
The newly created IfcActor or IfcOccupant

Return type:
ifcopenshell.entity_instance

Example:

# Setup an organisation with a single role

organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects Without Ballpens")
role = ifcopenshell.api.owner.add_role(model, assigned_object=organisation, role="ARCHITECT")

# Assign that organisation to a newly created actor

actor = ifcopenshell.api.owner.add_actor(model, actor=organisation)
ifcopenshell.api.owner.add_address(file: ifcopenshell.file, assigned_object: ifcopenshell.entity_instance, ifc_class: ADDRESS_TYPE = 'IfcPostalAddress') → ifcopenshell.entity_instance
Add a new telecom or postal address to an organisation or person

A person or organisation may have associated contact details such as phone numbers, mailing addresses, websites, email addresses, and instant messaging handles. This information is critical in recording the contact information of manufacturers and suppliers for facility management, or liable actors.

There are two types of addresses, postal addresses for physical snail mail, and telecom addresses for telephone or internet contact numbers and addresses.

Parameters:
assigned_object (ifcopenshell.entity_instance) – The IfcOrganization or IfcPerson the contact address belongs to.

ifc_class (str, optional) – Either IfcPostalAddress or IfcTelecomAddress. Defaults to IfcPostalAddress.

Returns:
The new IfcPostalAddress or IfcTelecomAddress

Return type:
ifcopenshell.entity_instance

Example:

organisation = ifcopenshell.api.owner.add_organisation(model)

# A snail mail address

postal = ifcopenshell.api.owner.add_address(model,
assigned_object=organisation, ifc_class="IfcPostalAddress")
ifcopenshell.api.owner.edit_address(model, address=postal,
attributes={"Purpose": "OFFICE", "AddressLines": ["42 Wallaby Way"],
"Town": "Sydney", "Region": "NSW", "PostalCode": "2000"})

# A phone or internet address

telecom = ifcopenshell.api.owner.add_address(model,
assigned_object=organisation, ifc_class="IfcTelecomAddress")
ifcopenshell.api.owner.edit_address(model, address=telecom,
attributes={"Purpose": "OFFICE", "TelephoneNumbers": ["+61432466949"],
"ElectronicMailAddresses": ["bobthebuilder@example.com"],
"WWWHomePageURL": "https://thinkmoult.com"})
ifcopenshell.api.owner.add_application(file: ifcopenshell.file, application_developer: ifcopenshell.entity_instance | None = None, version: str | None = None, application_full_name: str = 'IfcOpenShell', application_identifier: str = 'IfcOpenShell') → ifcopenshell.entity_instance
Adds a new application

IFC data may be associated with an authoring application to identify which application was responsible for editing or authoring the data. An application is defined by the developing organisation, as well as a full name and identifier. This is akin to how web browsers have an identification string.

Parameters:
application_developer (ifcopenshell.entity_instance, optional) – The IfcOrganization responsible for creating the application. Defaults to generating an IfcOpenShell organisation if none is provided.

version (str, optional) – The version of the application. Defaults to the ifcopenshell.version data if not specified.

application_full_name (str, optional) – The name of the application

application_identifier (str, optional) – An identification string for the application intended for computers to read.

Returns:
The newly created IfcApplication

Return type:
ifcopenshell.entity_instance

Example:

application = ifcopenshell.api.owner.add_application(model)
ifcopenshell.api.owner.add_organisation(file: ifcopenshell.file, identification: str = 'APTR', name: str = 'Aperture Science') → ifcopenshell.entity_instance
Adds a new organisation

Organisations are the main way to identify manufacturers, suppliers, and other actors who do not have a single representative or must not have any personally identifiable information.

Parameters:
identification (str, optional) – The short code identifying the organisation. Sometimes used in drawing naming schemes. Otherise used as a canonicalised way of computers to identify the organisation. Like their stock name.

name (str, optional) – The legal name of the organisation

Returns:
The newly created IfcOrganization

Return type:
ifcopenshell.entity_instance

Example:

organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects Without Ballpens")
ifcopenshell.api.owner.add_person(file: ifcopenshell.file, identification: str = 'HSeldon', family_name: str = 'Seldon', given_name: str = 'Hari') → ifcopenshell.entity_instance
Adds a new person

Persons are used to identify a legal or liable representative of an organisation or point of contact.

Parameters:
identification (str, optional) – The computer readable unique identification of the person. For example, their username in a CDE or alias.

family_name (str, optional) – The family name

given_name (str, optional) – The given name

Returns:
The newly created IfcPerson

Return type:
ifcopenshell.entity_instance

Example:

ifcopenshell.api.owner.add_person(model,
identification="bobthebuilder", family_name="Thebuilder", given_name="Bob")
ifcopenshell.api.owner.add_person_and_organisation(file: ifcopenshell.file, person: ifcopenshell.entity_instance, organisation: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Adds a paired person and organisation

A person and an organisation may be paired to create a representative belonging to a company.

Parameters:
person (ifcopenshell.entity_instance) – The IfcPerson being the representative of the organisation.

organisation (ifcopenshell.entity_instance) – The IfcOrganization it

Returns:
The newly created IfcPersonAndOrganization

Return type:
ifcopenshell.entity_instance

Example:

person = ifcopenshell.api.owner.add_person(model,
identification="lecorbycorbycorb", family_name="Curbosiar", given_name="Le")
organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects Without Ballpens")

ifcopenshell.api.owner.add_person_and_organisation(model,
person=person, organisation=organisation)
ifcopenshell.api.owner.add_role(file: ifcopenshell.file, assigned_object: ifcopenshell.entity_instance, role: str = 'ARCHITECT') → ifcopenshell.entity_instance
Adds and assigns a new role

People and organisations must play one or more roles on a project. Roles include architects, engineers, subcontractors, clients, manufacturers, etc. Typically these roles and their corresponding responsibilities will be outlined in contractual documents.

This function will both add and assign the role to the person or organisation.

Parameters:
assigned_object (ifcopenshell.entity_instance) – The IfcPerson or IfcOrganization the role should be assigned to.

role (str, optional) – The type of role, taken from the IFC documentation for IfcActorRole, or a custom name. Defaults to “ARCHITECT”.

Returns:
The newly created IfcActorRole

Return type:
ifcopenshell.entity_instance

Example:

organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects Without Ballpens")
ifcopenshell.api.owner.add_role(model, assigned_object=organisation, role="ARCHITECT")
ifcopenshell.api.owner.assign_actor(file: ifcopenshell.file, relating_actor: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Assigns an actor to an object

An actor may be assigned to objects which implies that the actor is responsible for. This is most commonly used in facility management for indicating the manufacturers, suppliers, and warrantors for product types.

Here are a list of objects you may assign an actor to:

IfcControl: Indicates project directives issued by the actor.

IfcGroup: Indicates groups for which the actor is responsible.

IfcProduct: Indicates products for which the actor is responsible.

IfcProcess: Indicates processes for which the actor is responsible.

IfcResource: Indicates resources for which the actor is responsible to
allocate, manage, or delegate. This is not the actor actually using the resource or performing the work. For that type of actor, see ifcopenshell.api.resource.assign_resource.

Parameters:
relating_actor (ifcopenshell.entity_instance) – The IfcActor who is responsible for the object.

related_object (ifcopenshell.entity_instance) – The object the actor is responsible for.

Returns:
The newly created IfcRelAssignsToActor relationship.

Return type:
ifcopenshell.entity_instance

Example:

# We need to procure and install 2 of this particular pump type in our facility.

pump_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcPumpType")

# Define who the manufacturer is

manufacturer = ifcopenshell.api.owner.add_organisation(model,
identification="PWP", name="Pumps With Power")
ifcopenshell.api.owner.add_role(model, assigned_object=manufacturer, role="MANUFACTURER")

# To help our facility manager, it's nice to provide contact details

# of the manufacturer so they know how to call when the pump breaks.

telecom = ifcopenshell.api.owner.add_address(model,
assigned_object=organisation, ifc_class="IfcTelecomAddress")
ifcopenshell.api.owner.edit_address(model, address=telecom,
attributes={"Purpose": "OFFICE", "TelephoneNumbers": ["+61432466949"],
"ElectronicMailAddresses": ["contact@example.com"],
"WWWHomePageURL": "https://example.com"})

# Make the manufacturer responsible for that pump type.

ifcopenshell.api.owner.assign_actor(model,
relating_actor=manufacturer, related_object=pump_type)
ifcopenshell.api.owner.create_owner_history(file: ifcopenshell.file) → ifcopenshell.entity_instance | None
Creates a new owner history indicating an element was added

Any object in IFC with a unique ID and name (such as physical products, tasks, calendars, etc) may have an owner associated with it. An owner is a liable person and/or organisation which a bit of metadata indicating whether they have created the object, edited the object, when the change was made, and which application they used.

IFC does not offer a comprehensive specification for version control and change tracking, as this is completely out of scope. However this similar ability allows IFC to satisfy legal requirements where object ownership, responsibilities, and permissions must be specified. Recording the owner is mandatory in IFC2X3 but optional in IFC4. It is not recommended to store this ownership data in IFC4 unless a legal requirement is in place.

Because owner tracking is mandatory in IFC2X3, be aware that some configuration may be required to work correctly. Read on.

To track the owner, at a minimum we have to know the application that the element was authored from, as well as the user (person and organisation) that made the change. The IfcOpenShell API is a low level software library and will not know what application the API is being called from, and nor does it have the responsibility to manage the “active user” making edits, which may be as simple as hardcoding it to “Bob” or even be as complex as integration with a CDE’s authentication system. As a result, the developer responsible to integrate with IfcOpenShell is expected to overload the ifcopenshell.api.owner.settings.get_user and ifcopenshell.api.owner.settings.get_application functions.

It is not necessary to call this function directly if you are already using other API calls. It is a low level function only available if you are writing your own advanced scripts and want to take advantage of the easier ownership tracking.

Returns:
The newly created IfcOwnerHistory element or None if it’s not IFC2X3 and user or application is not found in the current project.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

# Let's imagine we're writing a small script, not large enough to be

# its own fully branded application. In this case, let's use the

# default application which is prepopulated with "IfcOpenShell" as

# the name and version.

application = ifcopenshell.api.owner.add_application(model)

# Let's imagine we run this as an automated QA process in an

# architectural firm. However, the results must be signed off by the

# registered architect who is liable for the project.

person = ifcopenshell.api.owner.add_person(model,
identification="LPARTEE", family_name="Partee", given_name="Leeable")
organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects Without Ballpens")
user = ifcopenshell.api.owner.add_person_and_organisation(model,
person=person, organisation=organisation)

# Let's configure our owner settings to hardcode always returning

# the application and user. In theory, you could build complex user

# access control lookup functions here, but this is simple enough.

ifcopenshell.api.owner.settings.get_user = lambda x: user
ifcopenshell.api.owner.settings.get_application = lambda x: application

# We've finished our ownership setup. Now let's start our script and

# create a space. Notice we don't actually call

# create_owner_history at all. This is already automatically handled

# by the API when necessary. Under the hood, the API is actually

# running this code on the IfcSpace element:

# element.OwnerHistory = ifcopenshell.api.owner.create_owner_history(model)

space = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSpace")
ifcopenshell.api.owner.edit_actor(file: ifcopenshell.file, actor: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcActor

For more information about the attributes and data types of an IfcActor, consult the IFC documentation.

Parameters:
actor (ifcopenshell.entity_instance) – The IfcActor entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Setup an organisation with a single role

organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects Without Ballpens")
role = ifcopenshell.api.owner.add_role(model, assigned_object=organisation)
ifcopenshell.api.owner.edit_role(model, role=role, attributes={"Role": "ARCHITECT"})

# Assign that organisation to a newly created actor

actor = ifcopenshell.api.owner.add_actor(model, actor=organisation)

# Edit the description of the attribute.

ifcopenshell.api.actor.edit_actor(model,
actor=actor, attributes={"Description": "Responsible for buildings A, B, and C."})
ifcopenshell.api.owner.edit_address(file: ifcopenshell.file, address: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcAddress

For more information about the attributes and data types of an IfcAddress, consult the IFC documentation.

Parameters:
address (ifcopenshell.entity_instance) – The IfcAddress entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# A snail mail address

postal = ifcopenshell.api.owner.add_address(model,
assigned_object=organisation, ifc_class="IfcPostalAddress")
ifcopenshell.api.owner.edit_address(model, address=postal,
attributes={"Purpose": "OFFICE", "AddressLines": ["42 Wallaby Way"],
"Town": "Sydney", "Region": "NSW", "PostalCode": "2000"})

# A phone or internet address

telecom = ifcopenshell.api.owner.add_address(model,
assigned_object=organisation, ifc_class="IfcTelecomAddress")
ifcopenshell.api.owner.edit_address(model, address=telecom,
attributes={"Purpose": "OFFICE", "TelephoneNumbers": ["+61432466949"],
"ElectronicMailAddresses": ["bobthebuilder@example.com"],
"WWWHomePageURL": "https://thinkmoult.com"})
ifcopenshell.api.owner.edit_organisation(file: ifcopenshell.file, organisation: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcOrganization

For more information about the attributes and data types of an IfcOrganization, consult the IFC documentation.

Parameters:
organisation (ifcopenshell.entity_instance) – The IfcOrganization entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects With Ballpens")
ifcopenshell.api.owner.edit_organisation(model, organisation=organisation,
attributes={"name": "Architects Without Ballpens"})
ifcopenshell.api.owner.edit_person(file: ifcopenshell.file, person: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcPerson

For more information about the attributes and data types of an IfcPerson, consult the IFC documentation.

Parameters:
person (ifcopenshell.entity_instance) – The IfcPerson entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

person = ifcopenshell.api.owner.add_person(model,
identification="bobthebuilder", family_name="Thebuilder", given_name="Bob")
ifcopenshell.api.owner.edit_person(model, person=person,
attributes={"MiddleNames": ["The"], "FamilyName": "Builder"})
ifcopenshell.api.owner.edit_role(file: ifcopenshell.file, role: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcActorRole

For more information about the attributes and data types of an IfcActorRole, consult the IFC documentation.

Parameters:
role (ifcopenshell.entity_instance) – The IfcActorRole entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

person = ifcopenshell.api.owner.add_person(model,
identification="bobthebuilder", family_name="Thebuilder", given_name="Bob")

# By default, the role is an architect

role = ifcopenshell.api.owner.add_role(model, assigned_object=person)

# But Bob is not an architect

ifcopenshell.api.owner.edit_role(model, role=role, attributes={"Role": "CONSTRUCTIONMANAGER"})
ifcopenshell.api.owner.remove_actor(file: ifcopenshell.file, actor: ifcopenshell.entity_instance) → None
Removes an actor

Parameters:
actor (ifcopenshell.entity_instance) – The IfcActor to remove.

Returns:
None

Return type:
None

Example:

# Setup an organisation with a single role

organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects Without Ballpens")
role = ifcopenshell.api.owner.add_role(model, assigned_object=organisation)
ifcopenshell.api.owner.edit_role(model, role=role, attributes={"Role": "ARCHITECT"})

# Assign that organisation to a newly created actor

actor = ifcopenshell.api.owner.add_actor(model, actor=organisation)

# Actually we need ballpens on this project

ifcopenshell.api.owner.remove_actor(model, actor=actor)
ifcopenshell.api.owner.remove_address(file: ifcopenshell.file, address: ifcopenshell.entity_instance) → None
Removes an address

Naturally, any organisations or people using that address will have the relationship removed.

Parameters:
address (ifcopenshell.entity_instance) – The IfcAddress to remove.

Returns:
None

Return type:
None

Example:

organisation = ifcopenshell.api.owner.add_organisation(model)
address = ifcopenshell.api.owner.add_address(model,
assigned_object=organisation, ifc_class="IfcPostalAddress")

# Change our mind and delete it

ifcopenshell.api.owner.remove_address(model, address=address)
ifcopenshell.api.owner.remove_application(file: ifcopenshell.file, application: ifcopenshell.entity_instance) → None
Removes an application

Warning: removing an application may invalidate ownership histories. Check whether or not the application is used anywhere prior to removal.

Parameters:
address (ifcopenshell.entity_instance) – The IfcApplication to remove.

Returns:
None

Return type:
None

Example:

application = ifcopenshell.api.owner.add_application(model)
ifcopenshell.api.owner.remove_address(model, application=application)
ifcopenshell.api.owner.remove_organisation(file: ifcopenshell.file, organisation: ifcopenshell.entity_instance) → None
Remove an organisation

All roles and addresses assigned to the organisation will also be removed.

Parameters:
organisation (ifcopenshell.entity_instance) – The IfcOrganization to remove

Returns:
None

Return type:
None

Example:

organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects Without Ballpens")
ifcopenshell.api.owner.remove_organisation(model, organisation=organisation)
ifcopenshell.api.owner.remove_person(file: ifcopenshell.file, person: ifcopenshell.entity_instance) → None
Remove an person

All roles and addresses assigned to the person will also be removed. In IFC2X3 will also remove related inventories if person was the only responsile person for them.

Parameters:
person (ifcopenshell.entity_instance) – The IfcPerson to remove

Returns:
None

Return type:
None

Example:

ifcopenshell.api.owner.add_person(model,
identification="bobthebuilder", family_name="Thebuilder", given_name="Bob")
ifcopenshell.api.owner.remove_person(model, person=person)
ifcopenshell.api.owner.remove_person_and_organisation(file: ifcopenshell.file, person_and_organisation: ifcopenshell.entity_instance) → None
Removes a person and organisation

Note that the underlying person and organisation is not removed, only the “person and organisation” group.

Parameters:
person_and_organisation (ifcopenshell.entity_instance) – The IfcPersonAndOrganization to remove.

Returns:
None

Return type:
None

Example:

person = ifcopenshell.api.owner.add_person(model,
identification="lecorbycorbycorb", family_name="Curbosiar", given_name="Le")
organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects Without Ballpens")

user = ifcopenshell.api.owner.add_person_and_organisation(model,
person=person, organisation=organisation)

ifcopenshell.api.owner.remove_person_and_organisation(model, person_and_organisation=user)
ifcopenshell.api.owner.remove_role(file: ifcopenshell.file, role: ifcopenshell.entity_instance) → None
Removes a role

People and organisations using the role will be untouched. This may leave some of them without roles.

Parameters:
role (ifcopenshell.entity_instance) – The IfcActorRole to remove.

Returns:
None

Return type:
None

Example:

organisation = ifcopenshell.api.owner.add_organisation(model,
identification="AWB", name="Architects Without Ballpens")
role = ifcopenshell.api.owner.add_role(model, assigned_object=organisation, role="ARCHITECT")

# After running this, the organisation will have no role again

ifcopenshell.api.owner.remove_role(model, role=role)
ifcopenshell.api.owner.unassign_actor(file: ifcopenshell.file, relating_actor: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → None
Unassigns an actor to an object

This means that the actor is no longer responsible for the object.

Parameters:
relating_actor (ifcopenshell.entity_instance) – The IfcActor who is responsible for the object.

related_object (ifcopenshell.entity_instance) – The object the actor is responsible for.

Returns:
None

Return type:
None

Example:

# We need to procure and install 2 of this particular pump type in our facility.

pump_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcPumpType")

# Define who the manufacturer is

manufacturer = ifcopenshell.api.owner.add_organisation(model,
identification="PWP", name="Pumps With Power")
ifcopenshell.api.owner.add_role(model, assigned_object=manufacturer, role="MANUFACTURER")

# Make the manufacturer responsible for that pump type.

ifcopenshell.api.owner.assign_actor(model,
relating_actor=manufacturer, related_object=pump_type)

# Undo the assignment

ifcopenshell.api.owner.unassign_actor(model,
relating_actor=manufacturer, related_object=pump_type)
ifcopenshell.api.owner.update_owner_history(file: ifcopenshell.file, element: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Updates the owner that is assigned to an object

This ensures that the owner is tracked to have modified the object last, including the time when the change occured. See ifcopenshell.api.owner.create_owner_history for details.

Parameters:
element (ifcopenshell.entity_instance) – The IfcRoot element to update the ownership details on when a change is made.

Returns:
The updated IfcOwnerHistory element.

Return type:
ifcopenshell.entity_instance

Example:

# See ifcopenshell.api.owner.create_owner_history for setup

# [ ... example setup code ... ]

# We've finished our ownership setup. Now let's start our script and

# create a space. Notice we don't actually call

# create_owner_history at all. This is already automatically handled

# by the API when necessary. Under the hood, the API is actually

# running this code on the IfcSpace element:

# element.OwnerHistory = ifcopenshell.api.owner.create_owner_history(model)

space = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSpace")

# Any edits we make will have ownership tracking automatically

# applied. There is no need to run any owner.update_owner_history

# API calls either.

ifcopenshell.api.attribute.edit_attributes(model, product=space, attributes={"Name": "Lobby"})

ifcopenshell.api.profile
Handles the definition of cross sectional profiles

Maintaining a clean profile library is important for structural simulations and identification of standardised profiles for fabrication and carbon counting.

Submodules
ifcopenshell.api.profile.add_arbitrary_profile
ifcopenshell.api.profile.add_arbitrary_profile_with_voids
ifcopenshell.api.profile.add_parameterized_profile
ifcopenshell.api.profile.edit_profile
ifcopenshell.api.profile.remove_profile
Package Contents
ifcopenshell.api.profile.add_arbitrary_profile(file: ifcopenshell.file, profile: list[tuple[float, float]], name: str | None = None) → ifcopenshell.entity_instance
Adds a new arbitrary polyline-based profile

The profile is represented as a polyline defined by a list of coordinates. Only straight segments are allowed. Coordinates must be provided in SI meters.

To represent a closed curve, the first and last coordinate must be identical.

Parameters:
profile (list[tuple[float, float]]) – A list of coordinates

name (str, optional) – If the profile is semantically significant (i.e. to be managed and reused by the user) then it must be named. Otherwise, this may be left as none.

Returns:
The newly created IfcArbitraryClosedProfileDef

Return type:
ifcopenshell.entity_instance

Example:

# A 10mm by 100mm rectangle, such that might be used as a wooden

# skirting board or kick plate.

square = ifcopenshell.api.profile.add_arbitrary_profile(model,
profile=[(0., 0.), (.01, 0.), (.01, .1), (0., .1), (0., 0.)],
name="SK01 Profile")
ifcopenshell.api.profile.add_arbitrary_profile_with_voids(file: ifcopenshell.file, outer_profile: list[tuple[float, float]], inner_profiles: list[list[tuple[float, float]]], name: str | None = None) → ifcopenshell.entity_instance
Adds a new arbitrary polyline-based profile with voids

The outer profile is represented as a polyline defined by a list of coordinates. Only straight segments are allowed. Coordinates must be provided in SI meters.

To represent a closed curve, the first and last coordinate must be identical.

The inner profiles are represented as a list of polylines. Every polyline in defined by a list of coordinates. Only straight segments are allowed. Coordinates must be provided in SI meters.

Parameters:
outer_profile – A list of coordinates

inner_profiles – A list of polylines

name (str, optional) – If the profile is semantically significant (i.e. to be managed and reused by the user) then it must be named. Otherwise, this may be left as none.

Returns:
The newly created IfcArbitraryProfileDefWithVoids

Return type:
ifcopenshell.entity_instance

Example:

# A 400mm by 400mm square with a 200mm by 200mm hole in it.

square_with_hole = ifcopenshell.api.profile.add_arbitrary_profile_with_voids(model,
outer_profile=[(0., 0.), (.4, 0.), (.4, .4), (0., .4), (0., 0.)],
inner_profiles=[[(0.1, 0.1), (0.3, 0.1), (0.3, 0.3), (0.1, 0.3), (0.1, 0.1)]],
name="SK01 Hole Profile")
ifcopenshell.api.profile.add_parameterized_profile(file: ifcopenshell.file, ifc_class: str) → ifcopenshell.entity_instance
Adds a new parameterised profile

IFC offers parameterised profiles for common standardised hot roll steel sections and common concrete forms. A full list is available on the IFC documentation as subclasses of IfcParameterizedProfileDef.

Currently, this API has no benefit over directly calling ifcopenshell.file.create_entity.

Parameters:
ifc_class (str) – The subclass of IfcParameterizedProfileDef that you’d like to create.

Returns:
The newly created element depending on the specified ifc_class.

Return type:
ifcopenshell.entity_instance

Example:

circle = ifcopenshell.api.profile.add_parameterized_profile(model,
ifc_class="IfcCircleProfileDef")
circle.Radius = 1.
ifcopenshell.api.profile.edit_profile(file: ifcopenshell.file, profile: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcProfileDef

For more information about the attributes and data types of an IfcProfileDef, consult the IFC documentation.

Parameters:
profile (ifcopenshell.entity_instance) – The IfcProfileDef entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

circle = ifcopenshell.api.profile.add_parameterized_profile(model,
ifc_class="IfcCircleProfileDef")
circle = 1.

ifcopenshell.api.profile.edit_profile(model,
profile=circle, attributes={"ProfileName": "1000mm Dia"})
ifcopenshell.api.profile.remove_profile(file: ifcopenshell.file, profile: ifcopenshell.entity_instance) → None
Removes a profile

Parameters:
profile (ifcopenshell.entity_instance) – The IfcProfileDef to remove.

Returns:
None

Return type:
None

Example:

circle = ifcopenshell.api.profile.add_parameterized_profile(model,
ifc_class="IfcCircleProfileDef")
circle = 1.
ifcopenshell.api.profile.remove_profile(model, profile=circle)

ifcopenshell.api.project
Create an IFC project

All IFCs must have one, and only one IFC project before any data may be associated. If you are starting from scratch, see :func:create_file.

Once a project exists, you may optionally create project libraries and associate type assets with it. You may also append assets from other projects into your project.

Submodules
ifcopenshell.api.project.append_asset
ifcopenshell.api.project.assign_declaration
ifcopenshell.api.project.create_file
ifcopenshell.api.project.unassign_declaration
Package Contents
ifcopenshell.api.project.append_asset(file: ifcopenshell.file, library: ifcopenshell.file, element: ifcopenshell.entity_instance, reuse_identities: dict[int, ifcopenshell.entity_instance] | None = None) → ifcopenshell.entity_instance
Appends an asset from a library into the active project

A BIM library asset may be a type product (e.g. wall type), product (e.g. pump), material, profile, or cost schedule.

This copies the asset from the specified library file into the active project. It handles all details like ensuring that product materials, styles, properties, quantities, and so on are preserved.

If an asset contains geometry, the geometric contexts are also intelligentely transplanted such that existing equivalent contexts are reused.

Do not mix units.

Parameters:
library (ifcopenshell.file) – The file object containing the asset.

element (ifcopenshell.entity_instance) – An element in the library file of the asset. It may be an IfcTypeProduct, IfcProduct, IfcMaterial, IfcCostSchedule, or IfcProfileDef.

reuse_identities (dict[int, ifcopenshell.entity_instance]) – Optional dictionary of mapped entities’ identities to the already created elements. It will be used to avoid creating duplicated inverse elements during multiple project.append_asset calls. If you want to add just 1 asset or if added assets won’t have any shared elements, then it can be left empty.

Returns:
The appended element

Return type:
ifcopenshell.entity_instance

Example:

# Programmatically generate a library. You could do this visually too.

library = ifcopenshell.api.project.create_file()
root = ifcopenshell.api.root.create_entity(library, ifc_class="IfcProject", name="Demo Library")
context = ifcopenshell.api.root.create_entity(library,
ifc_class="IfcProjectLibrary", name="Demo Library")
ifcopenshell.api.project.assign_declaration(library, definitions=[context], relating_context=root)

# Assign units for our example library

unit = ifcopenshell.api.unit.add_si_unit(library,
unit_type="LENGTHUNIT", name="METRE", prefix="MILLI")
ifcopenshell.api.unit.assign_unit(library, units=[unit])

# Let's create a single asset of a 200mm thick concrete wall

wall_type = ifcopenshell.api.root.create_entity(library, ifc_class="IfcWallType", name="WAL01")
concrete = ifcopenshell.api.material.add_material(usecase.file, name="CON", category="concrete")
rel = ifcopenshell.api.material.assign_material(library,
products=[wall_type], type="IfcMaterialLayerSet")
layer = ifcopenshell.api.material.add_layer(library,
layer_set=rel.RelatingMaterial, material=concrete)
layer.Name = "Structure"
layer.LayerThickness = 200

# Mark our wall type as a reusable asset in our library.

ifcopenshell.api.project.assign_declaration(library,
definitions=[wall_type], relating_context=context)

# Let's imagine we're starting a new project

model = ifcopenshell.api.project.create_file()
project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject", name="Test")

# Now we can easily append our wall type from our libary

wall_type = ifcopenshell.api.project.append_asset(model, library=library, element=wall_type)
Example of adding multiple assets and avoiding duplicated inverses:

# since occurrences of IfcWindow of the same type

# might have shared inverses (e.g. IfcStyledItem)

# we provide a dictionary that will be populated with newly created items

# and reused to avoid duplicated elements

reuse_identities = dict()

for element in ifcopenshell.util.selector.filter_elements(model, "IfcWindow"):
ifcopenshell.api.project.append_asset(
model, library=library,
element=wall_type
reuse_identities=reuse_identities
)
ifcopenshell.api.project.assign_declaration(file: ifcopenshell.file, definitions: list[ifcopenshell.entity_instance], relating_context: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Declares the list of elements to the project

All data in a model must be directly or indirectly related to the project. Most data is indirectly related, existing instead within the spatial decomposition tree. Other data, such as types, may be declared at the top level.

Most of the time, the API handles declaration automatically for you. There is one scenario where you might want to explicitly declare objects to the project, and that’s when you want to organise objects into project libraries for future use (such as an assets library). Assigning a declaration lets you say that an object belongs to a library.

Parameters:
definitions (list[ifcopenshell.entity_instance]) – The list of objects you want to declare. Typically a list of assets.

relating_context (ifcopenshell.entity_instance) – The IfcProject, or more commonly the IfcProjectLibrary that you want the object to be part of.

Returns:
The new IfcRelDeclares relationship or None if all definitions were already declared / do not support declaration.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

# Programmatically generate a library. You could do this visually too.

library = ifcopenshell.api.project.create_file()
root = ifcopenshell.api.root.create_entity(library, ifc_class="IfcProject", name="Demo Library")
context = ifcopenshell.api.root.create_entity(library,
ifc_class="IfcProjectLibrary", name="Demo Library")

# It's necessary to say our library is part of our project.

ifcopenshell.api.project.assign_declaration(library, definitions=[context], relating_context=root)

# Assign units for our example library

unit = ifcopenshell.api.unit.add_si_unit(library,
unit_type="LENGTHUNIT", name="METRE", prefix="MILLI")
ifcopenshell.api.unit.assign_unit(library, units=[unit])

# Let's create a single asset of a 200mm thick concrete wall

wall_type = ifcopenshell.api.root.create_entity(library, ifc_class="IfcWallType", name="WAL01")
concrete = ifcopenshell.api.material.add_material(file, name="CON", category="concrete")
rel = ifcopenshell.api.material.assign_material(library,
products=[wall_type], type="IfcMaterialLayerSet")
layer = ifcopenshell.api.material.add_layer(library,
layer_set=rel.RelatingMaterial, material=concrete)
layer.Name = "Structure"
layer.LayerThickness = 200

# Mark our wall type as a reusable asset in our library.

ifcopenshell.api.project.assign_declaration(library,
definitions=[wall_type], relating_context=context)

# All done, just for fun let's save our asset library to disk for later use.

library.write("/path/to/my-library.ifc")
ifcopenshell.api.project.create_file(version: str = 'IFC4') → ifcopenshell.file
Create a blank IFC model file object

Create a new IFC file object based on the nominated schema version. The schema version you choose determines what type of IFC data you can store in this model. The file is blank and contains no entities.

It also sets up header data for STEP file serialisation, such as the current timestamp, IfcOpenShell as the preprocessor, and defaults to a DesignTransferView MVD.

Parameters:
version (str, optional) – The schema version of the IFC file. Choose from “IFC2X3”, “IFC4”, or “IFC4X3”. If you have loaded in a custom schema, you may specify that schema identifier here too.

Returns:
The created IFC file object.

Return type:
ifcopenshell.file

Example:

# Start a new model.

model = ifcopenshell.api.project.create_file()

# It's currently a blank model, so typically the first thing we do

# is create a project in it.

project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject", name="Test")

# ... and off we go!

ifcopenshell.api.project.unassign_declaration(file: ifcopenshell.file, definitions: list[ifcopenshell.entity_instance], relating_context: ifcopenshell.entity_instance) → None
Unassigns a list of objects from a project or project library

Typically used to remove an asset from a project library.

Parameters:
definitions (list[ifcopenshell.entity_instance]) – The list of objects you want to undeclare. Typically a list of assets.

relating_context (ifcopenshell.entity_instance) – The IfcProject, or more commonly the IfcProjectLibrary that you want the object to no longer be part of.

Returns:
None

Return type:
None

Example:

# Programmatically generate a library. You could do this visually too.

library = ifcopenshell.api.project.create_file()
root = ifcopenshell.api.root.create_entity(library, ifc_class="IfcProject", name="Demo Library")
context = ifcopenshell.api.root.create_entity(library,
ifc_class="IfcProjectLibrary", name="Demo Library")

# It's necessary to say our library is part of our project.

ifcopenshell.api.project.assign_declaration(library, definitions=[context], relating_context=root)

# Remove the library from our project

ifcopenshell.api.project.unassign_declaration(library, definitions=[context], relating_context=root)

ifcopenshell.api.pset
Property sets and quantity sets let you store simple key value metadata associated with elements

This is the simplest and most common way to store information about an element. For example, if a door has a fire rating, it is stored as a property.

Submodules
ifcopenshell.api.pset.add_pset
ifcopenshell.api.pset.add_qto
ifcopenshell.api.pset.edit_pset
ifcopenshell.api.pset.edit_qto
ifcopenshell.api.pset.remove_pset
Package Contents
ifcopenshell.api.pset.add_pset(file: ifcopenshell.file, product: ifcopenshell.entity_instance, name: str) → ifcopenshell.entity_instance
Adds a new property set to a product

Products, such as physical objects or types in IFC may have properties associated with them. These properties are typically simple key value metadata with data types. For example, a wall type may have a property called FireRating with a text value of “2HR”. Properties are grouped into property sets, so that related properties are grouped together.

If a property is assigned to a type, the property is inherited by all occurrences of that type. For example, a wall type with a FireRating property of “2HR” automatically implies that all walls of that wall type also have a FireRating of “2HR”. It is not necessary to explictly define the property again for each occurrence. This also means that properties are typically defined on types. If the same property is defined at an occurrence, this overrides the property defined on the type.

buildingSMART has come up with a long list of standardised properties for the most common properties required internationally. This solves the age-old question of “where do I store my FireRating data for walls”? The answer, in this case, is in the “FireRating” property with an “IfcLabel” data type grouped in the “Pset_WallCommon” property set. It is recommended to view the list of standardised buildingSMART properties and see if any suit your needs first. If none are appropriate, then you are free to create your own custom properties.

This function adds a blank named property set. One you have a property set you may add properties using ifcopenshell.api.pset.edit_pset.

See also ifcopenshell.api.pset.add_qto if you want to add quantification data, rather than arbitrary metadata.

Parameters:
product (ifcopenshell.entity_instance) – The IfcObject that you want to assign a property set to.

name (str) – The name of the property set. Property sets that are standardised by buildingSMART typically have a prefix of “Pset\_”, like “Pset_WallCommon”. If you create your own, you must not use that prefix. It is recommended to use your own prefix tailored to your project, company, or local government requirement.

Raises:
TypeError – If product class doesn’t support adding a pset.

Returns:
The newly created IfcPropertySet

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we have a new wall type.

wall_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWallType")

# Note that this only creates and assigns an empty property set. We

# still need to add properties into the property set. Having blank

# property sets are invalid.

pset = ifcopenshell.api.pset.add_pset(model, product=wall_type, name="Pset_WallCommon")

# Add a fire rating property standardised by buildingSMART.

ifcopenshell.api.pset.edit_pset(model, pset=pset, properties={"FireRating": "2HR"})
ifcopenshell.api.pset.add_qto(file: ifcopenshell.file, product: ifcopenshell.entity_instance, name: str) → ifcopenshell.entity_instance
Adds a new quantity set to a product

Products, such as physical objects or types in IFC may have quantities associated with them. These quantities are typically simple key value metadata with data types. For example, a wall type may have a quantity called NetSideArea with a area value of “4.2”. Quantities are grouped into quantity sets, so that related quantities are grouped together.

Quantities are similar to, but different from properties in that they may store a method of measurement or formula. Quantities may also have parametric relationships to other calculated values, such as cost schedules, resource utilisation, or construction task durations.

buildingSMART has come up with a long list of standardised quantities for the most common quantities required internationally. This solves the age-old question of “what’s the standard way of storing quantity take-off data”? It is recommended to view the list of standardised buildingSMART quantities and see if any suit your needs first. If none are appropriate, then you are free to create your own custom quantities.

This function adds a blank named quantity set. One you have a quantity set you may add quantities using ifcopenshell.api.pset.edit_qto.

See also ifcopenshell.api.pset.add_qto if you want to arbitrary metadata, rather than quantification data.

Parameters:
product (ifcopenshell.entity_instance) – The IfcObject that you want to assign a quantity set to.

name (str) – The name of the quantity set. Quantity sets that are standardised by buildingSMART typically have a prefix of “Qto\_”, like “Qto_WallBaseQuantities”. If you create your own, you must not use that prefix. It is recommended to use your own prefix tailored to your project, company, or local government requirement.

Returns:
The newly created IfcElementQuantity

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we have a new wall.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Note that this only creates and assigns an empty quantity set. We

# still need to add quantities into the property set. Having blank

# quantity sets are invalid.

qto = ifcopenshell.api.pset.add_qto(model, product=wall_type, name="Qto_WallBaseQuantities")

# Add a side area property standardised by buildingSMART. This

# allows quantity take-off to occur, even though no geometry has

# even been modelled!

ifcopenshell.api.pset.edit_qto(model, qto=qto, properties={"NetSideArea": 4.2})
ifcopenshell.api.pset.edit_pset(file: ifcopenshell.file, pset: ifcopenshell.entity_instance, name: str | None = None, properties: dict[str, Any] | None = None, pset_template: ifcopenshell.entity_instance | None = None, should_purge: bool = True) → None
Edits a property set and its properties

At its simplest usage, this may be used to edit the name of a property set. It may also be used to add, edit, or remove properties, either arbitrarily or using a property set template.

A list of properties are provided as a dictionary, where the keys are property names, and values are property values. Keys that don’t already exist are interpreted as properties to be added. Keys that already exist are interpreted as properties to be edited. A “None” value may specify a property to be deleted.

Properties must have a data type. There are lots of data types in IFCs, not just simple unitless data types like integers, booleans, text, but also distinguishing between types of text, like labels versus descriptive text. There are also lots of unit-based data types like areas, volumes, lengths, power, density, flow rates, pressure, etc.

To ensure the appropriate data type is used for properties, a property set template may be used. These can be seen as “property specifications”. A default selection is provided by buildingSMART, so that all buildingSMART defined standard properties have exactly the same data types and exactly the right property names without fear of invalid data or typos. The built-in buildingSMART templates are always loaded. However, you may also specify your own templates. If you try to add a non-standard property that does not exist in either your own template or in the built-in buildingSMART template, then you have the responsibility to ensure that data types are always consistent and correct.

Parameters:
pset (ifcopenshell.entity_instance) – The IfcPropertySet to edit.

name (str, optional) – A new name for the property set. If no name is specified, the property set name is not changed.

properties (dict) – A dictionary of properties. The keys must be a string of the name of the property. The data type of the value will be determined by the property set template. If no property set template is found, the data types of the Python values will influence the IFC data type of the property. String values will become IfcLabel, float values will become IfcReal, booleans will become IfcBoolean, and integers will become IfcInteger. If more control is desired, you may explicitly specify IFC data objects directly. Note that provided properties might be mutated in the process.

pset_template (ifcopenshell.entity_instance, optional) – If a property set template is provided, this will be used to determine data types. If no user-defined template is provided, the built-in buildingSMART templates will be loaded.

should_purge (bool, optional) – If set as False, properties set to None will be left as None but not removed. If set to true, properties set to None will actually be removed. The default of true is the same behaviour as ifcopenshell.api.pset.edit_qto().

Returns:
None

Return type:
None

Example:

# Let's imagine we have a new wall type.

wall_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWallType")

# This is a standard buildingSMART property set.

pset = ifcopenshell.api.pset.add_pset(model, product=wall_type, name="Pset_WallCommon")

# In this scenario, we don't specify any pset_template because it is

# part of the built-in buildingSMART templates, and so the

# FireRating will automatically be an IfcLabel, and the thermal

# transmittance value will automatically be an

# IfcThermalTransmittanceMeasure. Neither of these properties exist

# yet, so they will be created.

ifcopenshell.api.pset.edit_pset(model,
pset=pset, properties={"FireRating": "2HR", "ThermalTransmittance": 42.3})

# We can edit existing properties. In this case, "FireRating" is

# edited from "2HR" to "1HR". Combustible is new, and will be added.

# The existing "ThermalTransmittance" property will be left

# unchanged.

ifcopenshell.api.pset.edit_pset(model,
pset=pset, properties={"FireRating": "1HR", "Combustible": False})

# Setting to None will change the value but not delete the property.

ifcopenshell.api.pset.edit_pset(model, pset=pset, properties={"Combustible": None})

# If you actually want to delete the property, enable purging.

ifcopenshell.api.pset.edit_pset(model, pset=pset,
properties={"Combustible": None}, should_purge=True)

# What if we wanted to manage our own properties? Let's create our

# own "Company Standard" property set templates. Notice how we

# prefix our property set with "Foo\_", if our company name was "Foo"

# this would make sense.

template = ifcopenshell.api.pset_template.add_pset_template(model, name="Foo_bar")

# Let's imagine we want all model authors to specify two properties,

# one being a length measurement and another being a boolean.

prop1 = ifcopenshell.api.pset_template.add_prop_template(model,
pset_template=template, name="DemoA", primary_measure_type="IfcLengthMeasure")
prop2 = ifcopenshell.api.pset_template.add_prop_template(model,
pset_template=template, name="DemoB", primary_measure_type="IfcBoolean")

# Now we can use our property set template to add our properties,

# and the data types will always match our template.

pset = ifcopenshell.api.pset.add_pset(model, product=wall_type, name="Foo_Bar")
ifcopenshell.api.pset.edit_pset(model,
pset=pset, properties={"DemoA": 42.3, "DemoB": True}, pset_template=template)

# Here's a third scenario where we want to add arbitrary properties

# that are not standardised by anything, not even our own custom

# templates.

pset = ifcopenshell.api.pset.add_pset(model, product=wall_type, name="Custom_Pset")
ifcopenshell.api.pset.edit_pset(model,
pset=pset, properties={ # Basic Python data types are mapped to a sensible default
"SomeLabel": "Foo",
"SomeNumber": 12.3, # But we can always specify exactly what we're after too
"ExplicitLength": model.createIfcLengthMeasure(42.3)
})

# Editing existing properties will retain their current data types

# if possible. So this will still be a length measure.

ifcopenshell.api.pset.edit_pset(model, pset=pset, properties={"ExplicitLength": 12.3})
ifcopenshell.api.pset.edit_qto(file: ifcopenshell.file, qto: ifcopenshell.entity_instance, name: str | None = None, properties: dict[str, Any] | None = None, pset_template: ifcopenshell.entity_instance | None = None) → None
Edits a quantity set and its quantities

At its simplest usage, this may be used to edit the name of a quantity set. It may also be used to add, edit, or remove quantities.

See ifcopenshell.api.pset.edit_pset for documentation on how this is intended to be used.

One major difference is that quantities set to None are always purged. It is not allowed to have None quantities in IFC.

Parameters:
qto (ifcopenshell.entity_instance) – The IfcElementQuantity to edit.

name (str, optional) – A new name for the quantity set. If no name is specified, the quantity set name is not changed.

properties (dict) – A dictionary of properties. The keys must be a string of the name of the quantity. The data type of the value will be determined by the quantity set template. If no quantity set template is found, the data types of the Python values will influence the IFC data type of the quantity. String values will become IfcLabel, float values will become IfcReal, booleans will become IfcBoolean, and integers will become IfcInteger. If more control is desired, you may explicitly specify IFC data objects directly.

pset_template (ifcopenshell.entity_instance, optional) – If a quantity set template is provided, this will be used to determine data types. If no user-defined template is provided, the built-in buildingSMART templates will be loaded.

Returns:
None

Return type:
None

Example:

# Let's imagine we have a new wall type.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# This is a standard buildingSMART property set.

qto = ifcopenshell.api.pset.add_qto(model, product=wall, name="Qto_WallBaseQuantities")

# In this scenario, we don't specify any pset_template because it is

# part of the built-in buildingSMART templates, and so the Length

# will automatically be an IfcLengthMeasure, and the NetVolume will

# automatically be an IfcVolumeMeasure. Neither of these properties

# exist yet, so they will be created.

ifcopenshell.api.pset.edit_qto(model, qto=qto, properties={"Length": 12, "NetVolume": 7.2})

# Setting to None will delete the quantity.

ifcopenshell.api.pset.edit_qto(model, qto=qto, properties={"Length": None})

# What if we wanted to manage our own properties? Let's create our

# own "Company Standard" property set templates. Notice how we

# prefix our property set with "Foo\_", if our company name was "Foo"

# this would make sense. In this example, we say that our template

# only applies to walls and is for quantities.

template = ifcopenshell.api.pset_template.add_pset_template(model,
name="Foo_Wall", template_type="QTO_OCCURRENCEDRIVEN", applicable_entity="IfcWall")

# Let's imagine we want all model authors to specify a length

# measurement for the portion of a wall that is overhanging.

prop = ifcopenshell.api.pset_template.add_prop_template(model, pset_template=template,
name="OverhangLength", template_type="Q_LENGTH", primary_measure_type="IfcLengthMeasure")

# Now we can use our property set template to add our properties,

# and the data types will always match our template.

qto = ifcopenshell.api.pset.add_qto(model, product=wall, name="Foo_Wall")
ifcopenshell.api.pset.edit_qto(model,
qto=qto, properties={"OverhangLength": 42.3}, pset_template=template)

# Here's a third scenario where we want to add arbitrary quantities

# that are not standardised by anything, not even our own custom

# templates.

qto = ifcopenshell.api.pset.add_qto(model, product=wall, name="Custom_Qto")
ifcopenshell.api.pset.edit_qto(model,
qto=qto, properties={
"SomeLength": model.createIfcLengthMeasure(42.3),
"SomeArea": model.createIfcAreaMeasure(21.0)
})

# Editing existing quantities will retain their current data types

# if possible. So this will still be a length measure.

ifcopenshell.api.pset.edit_qto(model, qto=qto, properties={"SomeLength": 12.3})
ifcopenshell.api.pset.remove_pset(file: ifcopenshell.file, product: ifcopenshell.entity_instance, pset: ifcopenshell.entity_instance) → None
Removes a property set from a product

All properties that are part of this property set are also removed.

Parameters:
product (ifcopenshell.entity_instance) – The IfcObject to remove the property set from.

pset (ifcopenshell.entity_instance) – The IfcPropertySet or IfcElementQuantity to remove.

Returns:
None

Return type:
None

Example:

# Let's imagine we have a new wall type with a property set.

wall_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWallType")
pset = ifcopenshell.api.pset.add_pset(model, product=wall_type, name="Pset_WallCommon")

# Remove it!

ifcopenshell.api.pset.remove_pset(model, product=wall_type, pset=pset)

ifcopenshell.api.pset_template
Manage property templates to standard project property names and data types

To help standardise the naming, data types, and association of properties to elements, IFC supports property set templates. buildingSMART provides their own built-in ISO-standardised property templates, but governments, companies, and individuals may also create their own.

Submodules
ifcopenshell.api.pset_template.add_prop_template
ifcopenshell.api.pset_template.add_pset_template
ifcopenshell.api.pset_template.edit_prop_template
ifcopenshell.api.pset_template.edit_pset_template
ifcopenshell.api.pset_template.remove_prop_template
ifcopenshell.api.pset_template.remove_pset_template
Package Contents
ifcopenshell.api.pset_template.add_prop_template(file: ifcopenshell.file, pset_template: ifcopenshell.entity_instance, name: str = 'NewProperty', description: str | None = None, template_type: str = 'P_SINGLEVALUE', primary_measure_type: str = 'IfcLabel') → ifcopenshell.entity_instance
Adds new property templates to a property set template

Assuming you first have a property set template, this allows you to add templates for properties within that property set. A property template lets you specify the name, description, and data type of a property. When the template is provided to a model author, this gives them clear instructions about the intention of the property and exactly which data type to use.

Types of properties and quantities include:

P_SINGLEVALUE - a single value, the most common type of property.

P_ENUMERATEDVALUE - the property value may one or more values chosen
from a preset list of values.

P_BOUNDEDVALUE - the property has a minimum, maximum, and set value.

P_LISTVALUE - the property has a list of values.

P_TABLEVALUE - the property has a table of values.

P_REFERENCEVALUE - the property is a parametric reference to another
value. This is only for advanced users.

Q_LENGTH - the quantity is a length.

Q_AREA - the quantity is an area.

Q_VOLUME - the quantity is a volume.

Q_COUNT - the quantity is counting a item.

Q_WEIGHT - the quantity is a weight.

Q_TIME - the quantity is a time duration.

Parameters:
pset_template (ifcopenshell.entity_instance) – The property set template to add the property template to.

name (str,optional) – The name of the property

description (str,optional) – A few words describing what the property stores.

primary_measure_type – The data type of the property. Consult the IFC documentation for the full list of data types.

primary_measure_type – str,optional

Returns:
The newly created IfcSimplePropertyTemplate.

Return type:
ifcopenshell.entity_instance

Example:

# Create a simple template that may be applied to all types

template = ifcopenshell.api.pset_template.add_pset_template(model, name="ABC_RiskFactors")

# Here's one example property

ifcopenshell.api.pset_template.add_prop_template(model, pset_template=template,
name="HighVoltage", description="Whether there is a risk of high voltage.",
primary_measure_type="IfcBoolean")

# Here's another

ifcopenshell.api.pset_template.add_prop_template(model, pset_template=template,
name="ChemicalType", description="The class of chemical spillage.",
primary_measure_type="IfcLabel")
ifcopenshell.api.pset_template.add_pset_template(file: ifcopenshell.file, name: str = 'New_Pset', template_type: str = 'PSET_TYPEDRIVENOVERRIDE', applicable_entity: str = 'IfcObject,IfcTypeObject') → ifcopenshell.entity_instance
Adds a new property set template

This creates a new template for property sets. A template defines what the name of the property set should be, what properties it can have, what entities (e.g. wall) the property set can be assigned to, whether it should be assigned at a type or occurrence level, the data types of the properties, and descriptions of the properties. This template can then be used as a project, company, or local government standard.

buildingSMART itself ships a catalogue of property sets using these templates, ensuring that internationally common properties (e.g. fire rating of a wall) are all implemented exactly the same way across all vendors and projects. Naturally, not everything can be standardised internationally, so this allows you to create your own templates.

You may either create a property template to store properties, or a quantity template to store quantities. For convenience, we will always call them “property templates” as they are conceptually very similar.

This function only creates a template for the property set, not the properties themselves within the property set. At this level, you are allowed to define the name of the property set, whether it is type or occurrence based, and which entities it applies to.

See the documentation for IfcPropertySetTemplate for instructions on the types of template type and list of applicable entities.

The types of property set templates are:

PSET_TYPEDRIVENONLY - assigned only to types

PSET_TYPEDRIVENOVERRIDE - assigned to types or occurrences. If both,
the occurrence overrides the type.

PSET_OCCURRENCEDRIVEN - assigned to occurrences only.

PSET_PERFORMANCEDRIVEN - assigned as a timeseries data range. This is
only recommended for advanced users.

QTO_TYPEDRIVENONLY - assigned only to types, but for quantities.

QTO_TYPEDRIVENOVERRIDE - assigned to types or occurrences, but for
quantities. If both, the occurrence overrides the type.

QTO_OCCURRENCEDRIVEN - assigned to occurrences only, but for
quantities.

By default, this creates a template that can be applied to types, but overridden by occurrences, and is applicable to everything.

Parameters:
name (str,optional) – The name of the property set

template_type (str,optional) – Choose from one of PSET_TYPEDRIVENONLY, PSET_TYPEDRIVENOVERRIDE, PSET_OCCURRENCEDRIVEN, PSET_PERFORMANCEDRIVEN, QTO_TYPEDRIVENONLY, QTO_TYPEDRIVENOVERRIDE, QTO_OCCURRENCEDRIVEN, NOTDEFINED

applicable_entity (str,optional) – The entity that this template is allowed to be applied to. For example, IfcWall means that the property set may be assigned to walls only. IfcTypeObject, the default, means that the property set may be assigned to any type.

Returns:
The newly created IfcPropertySetTemplate

Return type:
ifcopenshell.entity_instance

Example:

# Create a simple template that may be applied to all types

ifcopenshell.api.pset_template.add_pset_template(model, name="ABC_RiskFactors")

# Note that we aren't finished yet. Our property set template

# doesn't have any properties in it. Let's add a minimum of one

# property.

ifcopenshell.api.pset_template.add_prop_template(model, pset_template=template,
name="HighVoltage", description="Whether there is a risk of high voltage.",
primary_measure_type="IfcBoolean")
ifcopenshell.api.pset_template.edit_prop_template(file: ifcopenshell.file, prop_template: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcSimplePropertyTemplate

For more information about the attributes and data types of an IfcSimplePropertyTemplate, consult the IFC documentation.

Parameters:
prop_template (ifcopenshell.entity_instance) – The IfcSimplePropertyTemplate entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

template = ifcopenshell.api.pset_template.add_pset_template(model, name="ABC_RiskFactors")

# Here's a property with just default values.

prop = ifcopenshell.api.pset_template.add_prop_template(model, pset_template=template)

# Let's edit it to give the actual values we need.

ifcopenshell.api.pset_template.edit_prop_template(model,
prop_template=prop, attributes={"Name": "DemoA", "PrimaryMeasureType": "IfcLengthMeasure"})
ifcopenshell.api.pset_template.edit_pset_template(file: ifcopenshell.file, pset_template: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcPropertySetTemplate

For more information about the attributes and data types of an IfcPropertySetTemplate, consult the IFC documentation.

Parameters:
pset_template (ifcopenshell.entity_instance) – The IfcPropertySetTemplate entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Whoops! We named it with a buildingSMART reserved "Pset\_" prefix!

template = ifcopenshell.api.pset_template.add_pset_template(model, name="Pset_RiskFactors")

# Let's fix it to prefix with our company code instead.

ifcopenshell.api.pset_template.edit_pset_template(model,
pset_template=template, attributes={"Name": "ABC_RiskFactors"})
ifcopenshell.api.pset_template.remove_prop_template(file: ifcopenshell.file, prop_template: ifcopenshell.entity_instance) → None
Removes a property template

Note that a property set template should always have at least one property template to be valid, so take care when removing property templates.

Parameters:
prop_template (ifcopenshell.entity_instance) – The IfcSimplePropertyTemplate to remove.

Returns:
None

Return type:
None

Example:

template = ifcopenshell.api.pset_template.add_pset_template(model, name="ABC_RiskFactors")

# Here's two propertes with just default values.

prop1 = ifcopenshell.api.pset_template.add_prop_template(model, pset_template=template)
prop2 = ifcopenshell.api.pset_template.add_prop_template(model, pset_template=template)

# Let's remove the second one.

ifcopenshell.api.pset_template.remove_prop_template(model, prop_template=prop2)
ifcopenshell.api.pset_template.remove_pset_template(file: ifcopenshell.file, pset_template: ifcopenshell.entity_instance) → None
Removes a property set template

All property templates within the property set template are also removed along with it.

Parameters:
pset_template (ifcopenshell.entity_instance) – The IfcPropertySetTemplate to remove.

Returns:
None

Return type:
None

Example:

# Create a template.

template = ifcopenshell.api.pset_template.add_pset_template(model, name="ABC_RiskFactors")

# Let's remove the template.

ifcopenshell.api.pset_template.remove_pset_template(model, pset_template=template)

ifcopenshell.api.resource
Manage construction and maintenance resources

Resources include equipment (cranes, etc), labour, material, and products. They are typically referenced in construction planning, maintenance schedules, or cost items.

Submodules
ifcopenshell.api.resource.add_resource
ifcopenshell.api.resource.add_resource_quantity
ifcopenshell.api.resource.add_resource_time
ifcopenshell.api.resource.assign_resource
ifcopenshell.api.resource.calculate_resource_usage
ifcopenshell.api.resource.calculate_resource_work
ifcopenshell.api.resource.edit_resource
ifcopenshell.api.resource.edit_resource_quantity
ifcopenshell.api.resource.edit_resource_time
ifcopenshell.api.resource.remove_resource
ifcopenshell.api.resource.remove_resource_quantity
ifcopenshell.api.resource.unassign_resource
Package Contents
ifcopenshell.api.resource.add_resource(file: ifcopenshell.file, parent_resource: ifcopenshell.entity_instance | None = None, ifc_class: str = 'IfcCrewResource', name: str | None = None, predefined_type: str = 'NOTDEFINED') → ifcopenshell.entity_instance
Add a new construction resource

Construction resources may be managed and connected to cost schedules and construction schedules. This allows calculations to be done on resource utilisation, cost optimisation (e.g. labour rates), and optioneering on build strategies.

There are typically two types of resources. Crew resources are resources where you manage your own crew and you have full control over the equipment, labour, products, and materials used by your crew. Alternatively, there are subcontractor resources, where you simply delegate all the details to a subcontractor and it is not decomposed into further levels of detail.

This means when adding resources, you’d first either add a crew or subcontract resource. If it is a crew resource, you’d then add child resources to that crew, such as equipment (cranes, excavators, hoists, etc), material (wood, concrete, etc), and labour (rigging crews, formworkers, etc).

Parameters:
parent_resource (ifcopenshell.entity_instance, optional) – If this is a child resource (typically to a crew resource), then nominate the parent IfcConstructionResource here.

ifc_class (str,optional) – The class of resource chosen from IfcConstructionEquipmentResource, IfcConstructionMaterialResource, IfcConstructionProductResource, IfcCrewResource, IfcLaborResource, or IfcSubContractResource.

name (str,optional) – The name of the resource

predefined_type (str,optional) – Consult the IFC documentation for the valid predefined types for each type of resource class.

Returns:
The newly created resource depending on the nominated IFC class.

Return type:
ifcopenshell.entity_instance

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Add some labour to our crew.

ifcopenshell.api.resource.add_resource(model, parent_resource=crew, ifc_class="IfcLaborResource")
ifcopenshell.api.resource.add_resource_quantity(file: ifcopenshell.file, resource: ifcopenshell.entity_instance, ifc_class: str = 'IfcQuantityCount') → ifcopenshell.entity_instance
Adds a quantity to a resource

The quantity of a resource represents the “unit quantity” of that resource. For example, labour might be hired on a daily basis (8 hours). There are different types of quantities (e.g. volume, count, or time). Which quantity is used depends on the type of resource. Material resources may be quantified in terms of length, area, volume, or weight. Equipment and labour resources are quantified in terms of time. Products resources are quantified in terms of counts.

This base quantity is then used in other calculations.

Parameters:
resource (ifcopenshell.entity_instance) – The IfcConstructionResource to add a quantity to.

ifc_class (str,optional) – The type of quantity to add, chosen from IfcQuantityArea (for material), IfcQuantityCount (for products), IfcQuantityLength (for material), IfcQuantityTime (for equipment or labour), IfcQuantityVolume (for material), and IfcQuantityWeight (for material).

Returns:
The newly created quantity depending on the IFC class

Return type:
ifcopenshell.entity_instance

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Add some labour to our crew.

labour = ifcopenshell.api.resource.add_resource(model,
parent_resource=crew, ifc_class="IfcLaborResource")

# Labour resource is quantified in terms of time.

quantity = ifcopenshell.api.resource.add_resource_quantity(model,
resource=labour, ifc_class="IfcQuantityTime")

# Store the time used in hours

ifcopenshell.api.resource.edit_resource_quantity(model,
physical_quantity=quantity, attributes={"TimeValue": 8.0})
ifcopenshell.api.resource.add_resource_time(file: ifcopenshell.file, resource: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Adds the time that a resource is used for

For labour and equipment resources, the total duration that the resource is used for may be stored. This may either be input manually or calculated parametrically. This is known as the resource time, and may be used to calculate other parameters like resource utilisation.

Parameters:
resource (ifcopenshell.entity_instance) – The IfcConstructionResource to record time for.

Returns:
The newly created IfcResourceTime

Return type:
ifcopenshell.entity_instance

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Add some labour to our crew.

labour = ifcopenshell.api.resource.add_resource(model,
parent_resource=crew, ifc_class="IfcLaborResource")

# Labour resource is quantified in terms of time.

quantity = ifcopenshell.api.resource.add_resource_quantity(model,
resource=labour, ifc_class="IfcQuantityTime")

# Store the unit time used in hours

ifcopenshell.api.resource.edit_resource_quantity(model,
physical_quantity=quantity, attributes={"TimeValue": 8.0})

# Let's imagine we've used the resource for 2 days.

time = ifcopenshell.api.resource.add_resource_time(model, resource=labour)
ifcopenshell.api.resource.edit_resource_time(model,
resource_time=time, attributes={"ScheduleWork": "PT16H"})
ifcopenshell.api.resource.assign_resource(file: ifcopenshell.file, relating_resource: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Assigns a resource to an object

Two types of objects are typically assigned to resources: products and actors.

If a product is assigned to a resource, that means that the product represents the resource on site. This may be represented via material handling zones on a construction site, or equipment like cranes and their physical locations.

If an actor is assigned to a resource, that means that the actor (person or organisation) is the actor consuming the resource (e.g. if the resource is material or equipment) or the actor performing the work (e.g. if the resource is a labour resource).

Parameters:
relating_resource (ifcopenshell.entity_instance) – The IfcResource to assign the object to.

related_object (ifcopenshell.entity_instance) – The IfcProduct or IfcActor to assign to the object.

Returns:
The newly created IfcRelAssignsToResource

Return type:
ifcopenshell.entity_instance

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Add some a tower crane to our crew.

crane = ifcopenshell.api.resource.add_resource(model,
parent_resource=crew, ifc_class="IfcConstructionEquipmentResource", name="Tower Crane 01")

# Our tower crane will be placed via this physical product.

product = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcBuildingElementProxy", predefined_type="CRANE")

# Let's place our crane at some X, Y coordinates.

matrix = numpy.eye(4)
matrix[0][3], matrix[1][3] = 3.0, 4.0
ifcopenshell.api.geometry.edit_object_placement(model, product=crane, matrix=matrix)

# Let's assign our crane to the resource. The crane now represents

# the resource.

ifcopenshell.api.resource.assign_resource(model, relating_resource=crane, related_object=product)

# Setup an organisation actor who will operate the crane

organisation = ifcopenshell.api.owner.add_organisation(model,
identification="UCO", name="Unionised Crane Operators Pty Ltd")
role = ifcopenshell.api.owner.add_role(model, assigned_object=organisation, role="CREW")
actor = ifcopenshell.api.owner.add_actor(model, actor=organisation)

# This means that UCO is now our crane operator.

ifcopenshell.api.resource.assign_resource(model, relating_resource=crane, related_object=actor)
ifcopenshell.api.resource.calculate_resource_usage(file: ifcopenshell.file, resource: ifcopenshell.entity_instance) → None
Calculates the number of resources required to perform scheduled work on a task.

ifcopenshell.api.resource.calculate_resource_work(file: ifcopenshell.file, resource: ifcopenshell.entity_instance) → None
Calculates the work that a resource is used for

This is an unofficial parametric calculation that may be done on a resource based on careful analysis of the relationships between the costing, scheduling, and resource domains in IFC.

A resource may store a productivity rate in a property set called EPset_Productivity. This stores three properties:

BaseQuantityConsumed - a duration that the resource is consumed for.

BaseQuantityProducedName - what quantity the resource can produce,
such as area or volume.

BaseQuantityProducedValue - what value of that quantity the resource
can produce during that duration.

For example, a labour or equipment resource might produce 100m3 of NetVolume every day (i.e. 8 hours are consumed).

Then, if a resource is assigned to a construction task, and that construction task is assigned to concrete slabs totalling 200m3, we can calculate that the resource consumes 16 hours of work.

This calculated work is stored against the resource as scheduled work under the resource time data.

Parameters:
resource (ifcopenshell.entity_instance) – The IfcConstructionResource that you want to calculate the work performed.

Return None:
Return type:
None:

ifcopenshell.api.resource.edit_resource(file: ifcopenshell.file, resource: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcResource

For more information about the attributes and data types of an IfcResource, consult the IFC documentation.

Parameters:
resource (ifcopenshell.entity_instance) – The IfcResource entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Change the name of the resource to "Zone A Crew"

ifcopenshell.api.resource.edit_resource(model, resource=resource, attributes={"Name": "Foo"})
ifcopenshell.api.resource.edit_resource_quantity(file: ifcopenshell.file, physical_quantity: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IFC quantity

For more information about the attributes and data types of an IfC quantity, consult the IFC documentation.

Parameters:
physical_quantity (ifcopenshell.entity_instance) – The IfC quantity entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Add some labour to our crew.

labour = ifcopenshell.api.resource.add_resource(model,
parent_resource=crew, ifc_class="IfcLaborResource")

# Labour resource is quantified in terms of time.

ifcopenshell.api.resource.add_resource_quantity(model,
resource=labour, ifc_class="IfcQuantityTime")

# Store the time used in hours

ifcopenshell.api.resource.edit_resource_quantity(model,
physical_quantity=time, attributes={"TimeValue": 8.0})
ifcopenshell.api.resource.edit_resource_time(file: ifcopenshell.file, resource_time: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcResourceTime

For more information about the attributes and data types of an IfcResourceTime, consult the IFC documentation.

Parameters:
resource_time (ifcopenshell.entity_instance) – The IfcResourceTime entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Add some labour to our crew.

labour = ifcopenshell.api.resource.add_resource(model,
parent_resource=crew, ifc_class="IfcLaborResource")

# Labour resource is quantified in terms of time.

ifcopenshell.api.resource.add_resource_quantity(model,
resource=labour, ifc_class="IfcQuantityTime")

# Store the unit time used in hours

ifcopenshell.api.resource.edit_resource_quantity(model,
physical_quantity=time, attributes={"TimeValue": 8.0})

# Let's imagine we've used the resource for 2 days.

time = ifcopenshell.api.resource.add_resource_time(model, resource=labour)
ifcopenshell.api.resource.edit_resource_time(model,
resource_time=time, attributes={"ScheduleWork": "P16H"})
ifcopenshell.api.resource.remove_resource(file: ifcopenshell.file, resource: ifcopenshell.entity_instance) → None
Removes a resource and all relationships

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Fire our crew

ifcopenshell.api.resource.remove_resource(model, resource=crew)
ifcopenshell.api.resource.remove_resource_quantity(file: ifcopenshell.file, resource: ifcopenshell.entity_instance) → None
Removes the base quantity of a resource

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Add some labour to our crew.

labour = ifcopenshell.api.resource.add_resource(model,
parent_resource=crew, ifc_class="IfcLaborResource")

# Labour resource is quantified in terms of time.

ifcopenshell.api.resource.add_resource_quantity(model,
resource=labour, ifc_class="IfcQuantityTime")

# Let's say we only want to store the resource but no quantities,

# let's clean up our mess and remove the quantity.

ifcopenshell.api.resource.remove_resource_quantity(model, resource=labour)
ifcopenshell.api.resource.unassign_resource(file: ifcopenshell.file, relating_resource: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → None
Removes the relationship between a resource and object

Parameters:
relating_resource (ifcopenshell.entity_instance) – The IfcResource to assign the object to.

related_object (ifcopenshell.entity_instance) – The IfcProduct or IfcActor to assign to the object.

Returns:
None

Return type:
None

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Add some a tower crane to our crew.

crane = ifcopenshell.api.resource.add_resource(model,
parent_resource=crew, ifc_class="IfcConstructionEquipmentResource", name="Tower Crane 01")

# Our tower crane will be placed via this physical product.

product = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcBuildingElementProxy", predefined_type="CRANE")

# Let's assign our crane to the resource. The crane now represents

# the resource.

ifcopenshell.api.resource.assign_resource(model,
relating_resource=crane, related_object=product)

# Undo it.

ifcopenshell.api.resource.unassign_resource(model,
relating_resource=crane, related_object=product)

ifcopenshell.api.root
Create, copy, or remove physical elements such as walls, doors, slabs, etc

This is one of the most used API modules and should be used any time you want to create, remove, copy, or change a physical or spatial element. See create_entity() to get started.

This module should also be used to create types. To then associate types with elements, see ifcopenshell.api.type.

Submodules
ifcopenshell.api.root.copy_class
ifcopenshell.api.root.create_entity
ifcopenshell.api.root.reassign_class
ifcopenshell.api.root.remove_product
Package Contents
ifcopenshell.api.root.copy_class(file: ifcopenshell.file, product: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Copies a product

The following relationships are also duplicated:

The copy will have the same object placement coordinates as the original.

The copy will have duplicated property sets, properties, and quantities

The copy will have all nested distribution ports copied too

The copy will be part of the same aggregate

The copy will be contained in the same spatial structure

The copy, if it is an occurrence, will have the same type

Voids are duplicated too

The copy will have the same material as the original. Parametric material set usages will be copied.

The copy will be part of the same groups as the original.

Be warned that:

Representations are _not_ copied. Copying representations is an expensive operation so for now the user is responsible for handling representations.

Filled voids are not copied, as there is no guarantee that the filling will also be copied.

Path connectivity is not copied, as there is no guarantee that the connections are still valid.

Parameters:
product – The IfcProduct to copy.

Returns:
The copied product

Return type:
ifcopenshell.entity_instance

Example:

# We have a wall

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# And now we have two

wall_copy = ifcopenshell.api.root.copy_class(model, product=wall)
ifcopenshell.api.root.create_entity(file: ifcopenshell.file, ifc_class: str = 'IfcBuildingElementProxy', predefined_type: str | None = None, name: str | None = None) → ifcopenshell.entity_instance
Create a new rooted product

This is a critical function used to create almost any rooted product or product type. If you want to create walls, spaces, buildings, wall types, and so on, use this function.

Just specify the class you want to create, as well as the predefined type and name. It will handle the storage of the predefined type and check whether the predefined type is built-in or custom. It will also generate a valid GlobalId and store ownership history. It will also handle some edge cases for default validity where users might forget to populate some mandatory attributes. For example, doors must define an operation type but many people forget.

Parameters:
ifc_class (str,optional) – Any rooted IFC class.

predefined_type (str,optional) – Any built-in or user-defined predefined type that is applicable to that IFC class. For user-defined predefined types just enter in any value and the API will handle it automatically.

name (str,optional) – The name of the new element.

Returns:
The newly created element based on the specified IFC class.

Return type:
ifcopenshell.entity_instance

Example:

# We have a project.

ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")

# We have a building.

ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")

# We have a wall.

ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# We have a wall type.

ifcopenshell.api.root.create_entity(model, ifc_class="IfcWallType")
ifcopenshell.api.root.reassign_class(file: ifcopenshell.file, product: ifcopenshell.entity_instance, ifc_class: str = 'IfcBuildingElementProxy', predefined_type: str | None = None) → ifcopenshell.entity_instance
Changes the class of a product

If you ever created a wall then realised it’s meant to be something else, this function lets you change the IFC class whilst retaining all other geometry and relationships.

This is especially useful when dealing with poorly classified data from proprietary software with limited IFC capabilities.

If you are reassigning a type, the occurrence classes are also reassigned to maintain validity.

Vice versa, if you are reassigning an occurrence, the type is also reassigned in IFC4 and up. In IFC2X3, this may not occur if the type cannot be unambiguously derived, so you are required to manually check this.

Parameters:
product (ifcopenshell.entity_instance) – The IfcProduct that you want to change the class of.

ifc_class (str,optional) – The new IFC class you want to change it to.

predefined_type (str,optional) – In case you want to change the predefined type too. User defined types are also allowed, just type what you want.

Returns:
The newly modified product.

Return type:
ifcopenshell.entity_instance

Example:

# We have a wall.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Oh, did I say wall? I meant slab.

slab = ifcopenshell.api.root.reassign_class(model, product=wall, ifc_class="IfcSlab")

# Warning: this will crash since wall doesn't exist any more.

print(wall) # Kaboom.
ifcopenshell.api.root.remove_product(file: ifcopenshell.file, product: ifcopenshell.entity_instance) → None
Removes a product

This is effectively a smart delete function that not only removes a product, but also all of its relationships. It is always recommended to use this function to prevent orphaned data in your IFC model.

This is intended to be used for removing:

IfcAnnotation

IfcElement

IfcElementType

IfcSpatialElement

IfcSpatialElementType

For example, geometric representations are removed. Placement coordinates are also removed. Properties are removed. Material, type, containment, aggregation, and nesting relationships are removed (but naturally, the materials, types, containers, etc themselves remain).

Parameters:
product (ifcopenshell.entity_instance) – The element to remove.

Returns:
None

Return type:
None

Example:

# We have a wall.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# No we don't.

ifcopenshell.api.root.remove_product(model, product=wall)

ifcopenshell.api.sequence
Manage work schedules, tasks, calendars, and more for 4D

These are typically used for construction planning, but may also be used in managing recurring facility maintenance schedules.

Submodules
ifcopenshell.api.sequence.add_task
ifcopenshell.api.sequence.add_task_time
ifcopenshell.api.sequence.add_time_period
ifcopenshell.api.sequence.add_work_calendar
ifcopenshell.api.sequence.add_work_plan
ifcopenshell.api.sequence.add_work_schedule
ifcopenshell.api.sequence.add_work_time
ifcopenshell.api.sequence.assign_lag_time
ifcopenshell.api.sequence.assign_process
ifcopenshell.api.sequence.assign_product
ifcopenshell.api.sequence.assign_recurrence_pattern
ifcopenshell.api.sequence.assign_sequence
ifcopenshell.api.sequence.assign_work_plan
ifcopenshell.api.sequence.calculate_task_duration
ifcopenshell.api.sequence.cascade_schedule
ifcopenshell.api.sequence.create_baseline
ifcopenshell.api.sequence.duplicate_task
ifcopenshell.api.sequence.edit_lag_time
ifcopenshell.api.sequence.edit_recurrence_pattern
ifcopenshell.api.sequence.edit_sequence
ifcopenshell.api.sequence.edit_task
ifcopenshell.api.sequence.edit_task_time
ifcopenshell.api.sequence.edit_work_calendar
ifcopenshell.api.sequence.edit_work_plan
ifcopenshell.api.sequence.edit_work_schedule
ifcopenshell.api.sequence.edit_work_time
ifcopenshell.api.sequence.recalculate_schedule
ifcopenshell.api.sequence.remove_task
ifcopenshell.api.sequence.remove_time_period
ifcopenshell.api.sequence.remove_work_calendar
ifcopenshell.api.sequence.remove_work_plan
ifcopenshell.api.sequence.remove_work_schedule
ifcopenshell.api.sequence.remove_work_time
ifcopenshell.api.sequence.unassign_lag_time
ifcopenshell.api.sequence.unassign_process
ifcopenshell.api.sequence.unassign_product
ifcopenshell.api.sequence.unassign_recurrence_pattern
ifcopenshell.api.sequence.unassign_sequence
Package Contents
ifcopenshell.api.sequence.add_task(file: ifcopenshell.file, work_schedule: ifcopenshell.entity_instance | None = None, parent_task: ifcopenshell.entity_instance | None = None, name: str | None = None, description: str | None = None, identification: str | None = None, predefined_type: str = 'NOTDEFINED') → ifcopenshell.entity_instance
Adds a new task

Tasks are typically used for two purposes: construction scheduling and facility management.

In construction scheduling, a task represents a job to be done in a work schedule. Tasks are organised in a hierarchical manner known as a work breakdown structure (WBS) and have lots of sequential relationships (e.g. this task must finish before the next task can start) and date information (e.g. durations, start dates). This is often represented as a gantt chart and used to analyse critical paths to try and reduce project time to stay on-time and within budget.

In facility management, a task represents a maintenance task to maintain a piece of equipment. Tasks are broken down into a punch list, or simply a bulleted or ordered sequence of tasks to be performed (e.g. turn off equipment, check power connection, etc) in order to maintain the equipment. Tasks will also typically have recurring scheduled dates in line with the maintenance schedule. These maintenance tasks and procedures are typically published as part of an operations and maintenance manual.

All tasks must be grouped in a work schedule, either directly as a root or top-level task, or indirectly as a child or subtask of a parent task. In construction scheduling, tasks may be nested many times to create the work breakdown structure, and the “leaf” tasks (i.e. tasks with no more subtasks) are considered to be the activities with dates, whereas all parent tasks are part of the breakdown structure used for categorisation purposes. In facility management, top-level tasks represent the overall maintenance job to be performed, and child tasks represent an ordered list of things to do for that maintenance. These form a 2-level hierarchy. No further child tasks are recommended.

Parameters:
work_schedule (ifcopenshell.entity_instance, optional) – The work schedule to group the task in, if the task is to be a top-level or root task. This is mutually exclusive with the parent_task parameter.

parent_task (ifcopenshell.entity_instance, optioanl) – The parent task, if the task is to be a subtask or child task. This is mutually exclusive with the work_schedule parameter.

name (str,optional) – The name of the task.

description (str,optional) – The description of the task.

identification (str,optional) – The identification code of the task.

predefined_type (str) – The predefined type of the task. Common ones include CONSTRUCTION, DEMOLITION, or MAINTENANCE. Consultant the IFC documentation for IfcTaskTypeEnum for more information.

Returns:
The newly created IfcTask

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Add a root task to represent the design milestones, and major

# project phases.

ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Milestones", identification="A")
ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Design", identification="B")
construction = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")

# Let's start creating our work breakdown structure.

ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Early Works", identification="C1")
ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Substructure", identification="C2")
superstructure = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Superstructure", identification="C3")

# Notice how the leaf task is the actual activity

ifcopenshell.api.sequence.add_task(model,
parent_task=superstructure, name="Ground Floor FRP", identification="C3.1")

# Let's imagine we are digitising an operations and maintenance

# manual for the mechanical discipline.

maintenance = ifcopenshell.api.sequence.add_work_schedule(model, name="Mechanical Maintenance")

# Imagine we have to clean the condenser coils for a chiller every

# month. Like the schedule above, to keep things simple we won't

# show scheduling times and calendars. This root task represents the

# overall maintenance task.

cleaning = ifcopenshell.api.sequence.add_task(model,
work_schedule=maintenance, name="Condenser coil cleaning")

# These subtasks represent the punch list of maintenance tasks.

ifcopenshell.api.sequence.add_task(model, parent_task=cleaning, identification="1",
description="Prior to work, wear safety shoes, gloves, and goggles.")
ifcopenshell.api.sequence.add_task(model, parent_task=cleaning, identification="2",
description="Prepare jet pump, screwdriver, hose clamp, and control panel door key.")
ifcopenshell.api.sequence.add_task(model, parent_task=cleaning, identification="3",
description="Switch OFF the chiller unit.")
ifcopenshell.api.sequence.add_task(model, parent_task=cleaning, identification="3",
description="Open the isolator switch.")
ifcopenshell.api.sequence.add_task(model, parent_task=cleaning, identification="3",
description="Setup the water pressure by tapping to a water supply and connecting to a ...")
ifcopenshell.api.sequence.add_task_time(file: ifcopenshell.file, task: ifcopenshell.entity_instance, is_recurring: bool = False) → ifcopenshell.entity_instance
Adds a task time to a task

Some tasks, such as activities within a work breakdown structure or overall maintenance tasks will have time related information. This includes start dates, durations, end dates, and possible recurring times (especially for maintenance tasks).

Parameters:
task (ifcopenshell.entity_instance) – The task to add time data to.

is_recurring (bool) – Whether or not the time should recur.

Returns:
The newly created IfcTaskTime.

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we are creating a construction schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Create a portion of a work breakdown structure.

construction = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")
superstructure = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Superstructure", identification="C3")
task = ifcopenshell.api.sequence.add_task(model,
parent_task=superstructure, name="Ground Floor FRP", identification="C3.1")

# Add time data. Note that time data is blank by default.

time = ifcopenshell.api.sequence.add_task_time(model, task=task)

# Let's say our task starts on the first of January when everybody

# is still drunk from the new years celebration, and lasts for 2

# days. Note we don't need to specify the end date, as that is

# derived from the start plus the duration. In this simple example,

# no calendar has been specified, so we are working 24/7. Yikes!

ifcopenshell.api.sequence.edit_task_time(model,
task_time=time, attributes={"ScheduleStart": "2000-01-01", "ScheduleDuration": "P2D"})
ifcopenshell.api.sequence.add_time_period(file: ifcopenshell.file, recurrence_pattern: ifcopenshell.entity_instance, start_time: str | datetime.time | None = None, end_time: str | datetime.time | None = None) → ifcopenshell.entity_instance
Adds a time period to a recurrence pattern

A recurring time may be an all-day event, or only during certain time periods of the day. For example, you might say that every 1st of January recurring is a public holiday, which is an all-day event. Alternatively, you might say that you work every (i.e. recurringly) Monday to Friday, from 9am to 5pm. The 9am to 5pm is the time period.

There may also be multiple recurrence patterns, such as from 9am to 12pm, and then another from 1pm to 5pm (to indicate an hour break for lunch).

Parameters:
recurrence_pattern (ifcopenshell.entity_instance) – The IfcRecurrencePattern to add the time period to. See ifcopenshell.api.sequence.assign_recurrence_pattern.

start_time (str,datetime.time) – The start time of the time period, in a format compatible with IfcTime, such as an ISO format time string or a datetime.time object.

end_time (str,datetime.time) – The end time of the time period, in a format compatible with IfcTime, such as an ISO format time string or a datetime.time object.

Returns:
The newly created IfcTimePeriod

Return type:
ifcopenshell.entity_instance

Example:

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model)

# Let's start defining the times that we work during the week.

work_time = ifcopenshell.api.sequence.add_work_time(model,
work_calendar=calendar, time_type="WorkingTimes")

# We create a weekly recurrence

pattern = ifcopenshell.api.sequence.assign_recurrence_pattern(model,
parent=work_time, recurrence_type="WEEKLY")

# State that we work from weekdays 1 to 5 (i.e. Monday to Friday)

ifcopenshell.api.sequence.edit_recurrence_pattern(model,
recurrence_pattern=pattern, attributes={"WeekdayComponent": [1, 2, 3, 4, 5]})

# The morning work session, lunch, then the afternoon work session.

ifcopenshell.api.sequence.add_time_period(model,
recurrence_pattern=pattern, start_time="09:00", end_time="12:00")
ifcopenshell.api.sequence.add_time_period(model,
recurrence_pattern=pattern, start_time="13:00", end_time="17:00")
ifcopenshell.api.sequence.add_work_calendar(file: ifcopenshell.file, name: str = 'Unnamed', predefined_type: str = 'NOTDEFINED') → ifcopenshell.entity_instance
Add a work calendar

A work calendar defines when work is allowed to occur and when the holidays are. This is a fundamental concept in construction planning. Every task in a work schedule will have an associated calendar. Some task and resources work 24/7, whereas others work Monday to Friday, or 5.5 day weeks, etc. This is important, as tasks durations may only occur during working times in a work calendar.

Work calendars can also be used to associate with events, such as indicating that during certain days and times of the year, motion sensors should turn on the lights, and other smart building controls.

Parameters:
name (str, optional) – The name of the calendar. Typically something like “5 Day Working Week” or “24/7”.

predefined_type – The type of calendar, typically used to more specifically define shifts, such as FIRSTSHIFT, SECONDSHIFT, or THIRDSHIFT. Leave as NOTDEFINED for basic calendar usage.

Returns:
The newly created IfcWorkCalendar

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Add a root task to represent the construction tasks.

task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model, name="5 Day Week")

# Let's start defining the times that we work during the week.

work_time = ifcopenshell.api.sequence.add_work_time(model,
work_calendar=calendar, time_type="WorkingTimes")

# We create a weekly recurrence

pattern = ifcopenshell.api.sequence.assign_recurrence_pattern(model,
parent=work_time, recurrence_type="WEEKLY")

# State that we work from weekdays 1 to 5 (i.e. Monday to Friday), 9am to 5pm

ifcopenshell.api.sequence.edit_recurrence_pattern(model,
recurrence_pattern=pattern, attributes={"WeekdayComponent": [1, 2, 3, 4, 5]})
ifcopenshell.api.sequence.add_time_period(model,
recurrence_pattern=pattern, start_time="09:00", end_time="17:00")

# We associate the calendar with the construction root task. All

# subtasks underneath the construction work task will also inherit

# this calendar by default (though you can override them).

ifcopenshell.api.control.assign_control(model, relating_control=calendar, related_object=task)
ifcopenshell.api.sequence.add_work_plan(file: ifcopenshell.file, name: str | None = None, predefined_type: str = 'NOTDEFINED', start_time: str | datetime.time | None = None) → ifcopenshell.entity_instance
Add a new work plan

A work plan is a group of work schedules. Since work schedules may have different purposes, such as for maintenance or construction scheduling, baseline comparison, or phasing, work plans can be used to group related work schedules. At a minimum, it is recommended to use work plans to indicate whether the work schedules are for facility management or for construction scheduling.

Parameters:
name (str, optional) – The name of the work plan. Recommended to be “Maintenance” or “Construction” for the two main purposes.

predefined_type (str) – The type of work plan, used for baselining. Leave as “NOTDEFINED” if unsure.

start_time (str,datetime.time) – The earliest start time when the schedules grouped within the work plan are relevant.

Returns:
The newly created IfcWorkPlan

Return type:
ifcopenshell.entity_instance

Example:

# This will hold all our construction schedules

work_plan = ifcopenshell.api.sequence.add_work_plan(model, name="Construction")

# This is one of our schedules in our work plan.

schedule = ifcopenshell.api.sequence.add_work_schedule(model,
name="Construction Schedule A", work_plan=work_plan)
ifcopenshell.api.sequence.add_work_schedule(file: ifcopenshell.file, name: str = 'Unnamed', predefined_type: str = 'NOTDEFINED', object_type=None, start_time: str | datetime.time | None = None, work_plan: ifcopenshell.entity_instance | None = None) → ifcopenshell.entity_instance
Add a new work schedule

A work schedule is a group of tasks, where the tasks are typically either for maintenance or for construction scheduling.

Parameters:
name (str) – The name of the work schedule.

predefined_type (str) – The type of schedule, chosen from ACTUAL, BASELINE, and PLANNED. Typically you would start with PLANNED, then convert to a BASELINE when changes are made with separate schedules, then have a parallel ACTUAL schedule.

start_time (str,datetime.time,optional) – The earlier start time when the schedule is relevant. May be represented with an ISO standard string.

work_plan (ifcopenshell.entity_instance,optional) – The IfcWorkPlan the schedule will be part of. If not provided, the schedule will not be grouped in a work plan and would exist as a top level schedule in the project. This is not recommended.

Returns:
The newly created IfcWorkSchedule

Return type:
ifcopenshell.entity_instance

Example:

# This will hold all our construction schedules

work_plan = ifcopenshell.api.sequence.add_work_plan(model, name="Construction")

# Let's imagine this is one of our schedules in our work plan.

schedule = ifcopenshell.api.sequence.add_work_schedule(model,
name="Construction Schedule A", work_plan=work_plan)

# Add a root task to represent the design milestones, and major

# project phases.

ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Milestones", identification="A")
ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Design", identification="B")
construction = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")
ifcopenshell.api.sequence.add_work_time(file: ifcopenshell.file, work_calendar: ifcopenshell.entity_instance, time_type: TIME_TYPE = 'WorkingTimes') → ifcopenshell.entity_instance
Add either working times or holiday times to a calendar

A calendar defines when work occurs by defining working times and holiday times. First, the working times are defined, then the holidays may override the working times. For this reason, holidays are also known as exception times. For example, you might define the working times as every Monday to Friday, then define a few holidays in the year, such as the 1st of January. If the 1st of January is on a weekday, it will override the work time.

Parameters:
work_calendar (ifcopenshell.entity_instance) – The IfcWorkCalendar to add the work or holiday time definition to.

time_type (str) – Either WorkingTimes or ExceptionTimes, depending on what you want to define.

Returns:
The newly created IfcWorkTime

Return type:
ifcopenshell.entity_instance

Example:

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model)

# Let's start defining the times that we work during the week.

work_time = ifcopenshell.api.sequence.add_work_time(model,
work_calendar=calendar, time_type="WorkingTimes")

# We create a weekly recurrence

pattern = ifcopenshell.api.sequence.assign_recurrence_pattern(model,
parent=work_time, recurrence_type="WEEKLY")

# State that we work from weekdays 1 to 5 (i.e. Monday to Friday)

ifcopenshell.api.sequence.edit_recurrence_pattern(model,
recurrence_pattern=pattern, attributes={"WeekdayComponent": [1, 2, 3, 4, 5]})

# Let's set some holidays

holidays = ifcopenshell.api.sequence.add_work_time(model,
work_calendar=calendar, time_type="ExceptionTimes")

# We create a yearly recurrence

pattern = ifcopenshell.api.sequence.assign_recurrence_pattern(model,
parent=work_time, recurrence_type="YEARLY_BY_DAY_OF_MONTH")

# The holiday is every 1st of January

ifcopenshell.api.sequence.edit_recurrence_pattern(model,
recurrence_pattern=pattern, attributes={"DayComponent": [1], "MonthComponent": [1]})
ifcopenshell.api.sequence.assign_lag_time(file: ifcopenshell.file, rel_sequence: ifcopenshell.entity_instance, lag_value: str, duration_type: str = 'WORKTIME') → ifcopenshell.entity_instance
Assign a lag time to a sequence relationship between tasks

A task sequence (e.g. finish to start) may optionally have a lag time defined. This is a fundamental concept in construction scheduling. The lag is defined as a duration, and the duration is typically either calendar based (i.e. follows the working times and holidays of the calendar) or elapsed time based (i.e. 24/7).

A sequence may only have a single lag time defined. Negative lag times are allowed.

Parameters:
rel_sequence (ifcopenshell.entity_instance) – The IfcRelSequence to assign the lag time to.

lag_value (str) – An ISO standardised duration string.

duration_type (str) – Choose from WORKTIME for the associated calendar-based lag times (this is the most common scenario and is recommended as a default), or ELAPSEDTIME to not follow the calendar. You may also choose NOTDEFINED but the behaviour of this is unclear.

Returns:
The newly created IfcLagTime

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's imagine a root construction task

construction = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")

# Let's imagine we're doing a typically formwork, reinforcement,

# pour sequence. Let's start with the formwork. It'll take us 2

# days.

formwork = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Formwork", identification="C.1")
time = ifcopenshell.api.sequence.add_task_time(model, task=formwork)
ifcopenshell.api.sequence.edit_task_time(model,
task_time=time, attributes={"ScheduleStart": "2000-01-01", "ScheduleDuration": "P2D"})

# Now let's do the reinforcement. It'll take us another 2 days.

reinforcement = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Reinforcement", identification="C.2")
time = ifcopenshell.api.sequence.add_task_time(model, task=reinforcement)
ifcopenshell.api.sequence.edit_task_time(model,
task_time=time, attributes={"ScheduleStart": "2000-01-01", "ScheduleDuration": "P2D"})

# Now let's say the formwork must finish before the reinforcement

# can start. This is a typical finish to start relationship (FS).

sequence = ifcopenshell.api.sequence.assign_sequence(model,
relating_process=formwork, related_process=reinforcement)

# Now typically there would be no lag time between formwork and

# reinforcement, but let's pretend that we had to allow 1 day gap

# for whatever reason.

ifcopenshell.api.sequence.assign_lag_time(model, rel_sequence=sequence, lag_value="P1D")
ifcopenshell.api.sequence.assign_process(file: ifcopenshell.file, relating_process: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Assigns an object to be related to a process, typically a construction task

Processes work using the ICOM (Input, Controls, Outputs, Mechanisms) paradigm in IFC. This process model is commonly used in modeling manufacturing functions.

For example, processes (such as tasks) consume Inputs and transform them into Outputs. The process may only occur within the limits of Controls (e.g. cost items) and may require Mechanisms (ISO9000 calls them Mechanisms, whereas IFC calls them resources, such as raw materials, labour, or equipment).

Controls

V

+——–+ +———+ +———+ | Inputs | –> | Process | –> | Outputs | +——–+ +———+ +———+

Resources

There are three main scenarios where an object may be related to a task: defining inputs, controls, and resources of a process.

For inputs, a product (i.e. wall) may be defined as an input to a task, such as when the task is to demolish the wall (i.e. the wall is an input, and there is no output).

For controls, a cost item may be defined as a control to a task.

For resources, any construction resource may be assigned to a task.

Parameters:
relating_process (ifcopenshell.entity_instance) – The IfcProcess (typically IfcTask) that the input, control, or resource is related to.

related_object (ifcopenshell.entity_instance) – The IfcProduct (for input), IfcCostItem (for control) or IfcConstructionResource (for resource).

Returns:
The newly created IfcRelAssignsToProcess relationship

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's create a construction task. Note that the predefined type is

# important to distinguish types of tasks.

task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Demolish existing", identification="A", predefined_type="DEMOLITION")

# Let's say we have a wall somewhere.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Let's demolish that wall!

ifcopenshell.api.sequence.assign_process(model, relating_process=task, related_object=wall)
ifcopenshell.api.sequence.assign_product(file: ifcopenshell.file, relating_product: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Assigns a product to be produced as a result of a process

A construction task may result in products (e.g. a wall) being constructed. These task “Outputs” are defined in IFC through product relationships.

Not all tasks have Outputs. For example, maintenance tasks will typically not have any outputs.

See ifcopenshell.api.sequence.assign_process for Inputs and other types of process relationships that can be described in manufacturing process modeling.

Parameters:
relating_product (ifcopenshell.entity_instance) – The IfcProduct that was constructed as a result of the task.

related_object (ifcopenshell.entity_instance) – The IfcProcess (typically IfcTask) of the construction task.

Returns:
The newly created IfcRelAssignsToProduct relationship

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's create a construction task. Note that the predefined type is

# important to distinguish types of tasks.

task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Build wall", identification="A", predefined_type="CONSTRUCTION")

# Let's say we have a wall somewhere.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Let's construct that wall!

ifcopenshell.api.sequence.assign_product(model, relating_product=wall, related_object=task)
ifcopenshell.api.sequence.assign_recurrence_pattern(file: ifcopenshell.file, parent: ifcopenshell.entity_instance, recurrence_type: ifcopenshell.util.sequence.RECURRENCE_TYPE = 'WEEKLY') → ifcopenshell.entity_instance
Define a time to recur at a particular interval

There are two scenarios where you might want to define a recurring time pattern.

You might want a task to be scheduled at a recurring interval, this is common for maintenance tasks which need to be performed monthly, every 6 months, every year, etc.

Alternatively, you might be defining a work calendar, which defines working days or holidays. The working days might be every week from monday to friday (“every” week means it recurs every week), or the holidays might be the same every year.

The types of recurrence are:

DAILY: every Nth (interval) day for up to X (Occurrences) occurrences.
e.g. Every day, every 2 days, every day up to 5 times, etc

WEEKLY: every Nth (interval) MTWTFSS (WeekdayComponent) for up to X
(Occurrences) occurrences. e.g. Every Monday, every weekday, every other saturday, etc

MONTHLY_BY_DAY_OF_MONTH: every Nth (DayComponent) of every Xth
(Interval) Month up to Y (Occurrences) occurrences. e.g. Every 15th of the Month.

MONTHLY_BY_POSITION: Every Nth (Position) MTWTFSS (WeekdayComponent)
of every Xth (Interval) Month up to Y (Occurrences) occurrences. e.g. Every second Tuesday of the Month.

YEARLY_BY_DAY_OF_MONTH: every Nth (DayComponent) of every JFMAMJJASOND
(MonthComponent) month of every Yth (Interval) Year up to Z (Occurrences) occurrences. e.g. every 25th of December.

YEARLY_BY_POSITION: every Nth (Position) MTWTFSS (WeekdayComponent) of
every JFMAMJJASOND (MonthComponent) month of every Yth (Interval) Year up to Z (Occurrences) occurrences. e.g. every third Wednesday of January.

These recurrence patterns are fairly standard in all calendar and scheduling applications.

Parameters:
parent (ifcopenshell.entity_instance) – Either an IfcTaskTimeRecurring if you are defining a recurring schedule for a task, or IfcWorkTime if you are defining a recurring pattern for a workdays or holidays in a calendar.

recurrence_type (str) – One of the types of recurrences.

Returns:
The newly created IfcRecurrencePattern

Return type:
ifcopenshell.entity_instance

Example:

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model)

# Let's start defining the times that we work during the week.

work_time = ifcopenshell.api.sequence.add_work_time(model,
work_calendar=calendar, time_type="WorkingTimes")

# We create a weekly recurrence

pattern = ifcopenshell.api.sequence.assign_recurrence_pattern(model,
parent=work_time, recurrence_type="WEEKLY")

# State that we work from weekdays 1 to 5 (i.e. Monday to Friday)

ifcopenshell.api.sequence.edit_recurrence_pattern(model,
recurrence_pattern=pattern, attributes={"WeekdayComponent": [1, 2, 3, 4, 5]})

# Let's imagine we are creating a maintenance schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Equipment Maintenance")

# Now let's imagine we have a task to maintain the chillers

task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Chiller maintenance")

# Because it is a maintenance task, we must schedule a recurring time

time = ifcopenshell.api.sequence.add_task_time(model, task=task, is_recurring=True)

# We create a monthly recurrence

pattern = ifcopenshell.api.sequence.assign_recurrence_pattern(model,
parent=work_time, recurrence_type="MONTHLY_BY_DAY_OF_MONTH")

# Specifically, the maintenance task must occur every 6 months

ifcopenshell.api.sequence.edit_recurrence_pattern(model,
recurrence_pattern=pattern, attributes={"DayComponent": [1], "Interval": 6})
ifcopenshell.api.sequence.assign_sequence(file: ifcopenshell.file, relating_process: ifcopenshell.entity_instance, related_process: ifcopenshell.entity_instance, sequence_type: str = 'FINISH_START') → ifcopenshell.entity_instance
Assign a sequential relationship between tasks

Tasks in construction sequencing typically have sequence relationships between them, indicating that one task must happen after another. This is used to automatically compute new start and end dates and cascade changes when dates are changed. This is also used to calculate critical paths and floats.

There are four types of sequence relationships, known as finish to start, finish to finish, start to start, and start to finish, sometimes abbreviated as a (FS, FF, SS, and SF). The most common is the finish to start relationship, indicating that the previous task must finish before the next task can start.

You must not create cyclical task sequences. This makes the computer unhappy.

Note that “previous” or “next” does not necessarily mean the task chronologically happens before or after. They simply indicate the order of the sequence relationship. For this reason, they are often called predecessor and successor tasks in the planning profession.

Parameters:
relating_process (ifcopenshell.entity_instance) – The previous / predecessor task.

related_process (ifcopenshell.entity_instance) – The next / successor task.

sequence_type – Choose from FINISH_START, FINISH_FINISH, START_START, or START_FINISH.

Returns:
The newly created IfcRelSequence

Return type:
ifcopenshell.entity_instance

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's imagine a root construction task

construction = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")

# Let's imagine we're doing a typically formwork, reinforcement,

# pour sequence. Let's start with the formwork. It'll take us 2

# days.

formwork = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Formwork", identification="C.1")
time = ifcopenshell.api.sequence.add_task_time(model, task=formwork)
ifcopenshell.api.sequence.edit_task_time(model,
task_time=time, attributes={"ScheduleStart": "2000-01-01", "ScheduleDuration": "P2D"})

# Now let's do the reinforcement. It'll take us another 2 days.

reinforcement = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Reinforcement", identification="C.2")
time = ifcopenshell.api.sequence.add_task_time(model, task=reinforcement)
ifcopenshell.api.sequence.edit_task_time(model,
task_time=time, attributes={"ScheduleStart": "2000-01-01", "ScheduleDuration": "P2D"})

# Now the pour it It'll only take 1 day.

pour = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Reinforcement", identification="C.3")
time = ifcopenshell.api.sequence.add_task_time(model, task=pour)
ifcopenshell.api.sequence.edit_task_time(model,
task_time=time, attributes={"ScheduleStart": "2000-01-01", "ScheduleDuration": "P1D"})

# Now let's say the formwork must finish before the reinforcement

# can start, and the reinforcement must finish before the pour can

# start. This is a typical finish to start relationship (FS).

ifcopenshell.api.sequence.assign_sequence(model,
relating_process=formwork, related_process=reinforcement)
ifcopenshell.api.sequence.assign_sequence(model,
relating_process=reinforcement, related_process=pour)

# Notice how we set all the scheduled start dates arbitrarily at

# 2000-01-01. This is because we can ask IfcOpenShell to

# automatically cascade the dates, starting from any task. This will

# update the reinforcement date to be 2000-01-03 and the pour date

# to be 2000-01-05.

ifcopenshell.api.sequence.cascade_schedule(model, task=formwork)
ifcopenshell.api.sequence.assign_work_plan(file: ifcopenshell.file, work_schedule: ifcopenshell.entity_instance, work_plan: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Assigns a work schedule to a work plan

Typically, work schedules would be assigned to a work plan at creation. However you may also delay this and do it manually afterwards.

Parameters:
work_schedule (ifcopenshell.entity_instance) – The IfcWorkSchedule that will be assigned to the work plan.

work_plan (ifcopenshell.entity_instance) – The IfcWorkPlan for the schedule to be assigned to.

Returns:
The IfcRelAggregates relationship

Return type:
ifcopenshell.entity_instance

Example:

# This will hold all our construction schedules

work_plan = ifcopenshell.api.sequence.add_work_plan(model, name="Construction")

# Alternatively, if you create a schedule without a work plan ...

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# ... you can assign the work plan afterwards.

ifcopenshell.api.sequence.assign_work_plan(work_schedule=schedule, work_plan=work_plan)
ifcopenshell.api.sequence.calculate_task_duration(file: ifcopenshell.file, task: ifcopenshell.entity_instance) → None
Calculates the task duration based on resource usage

If a task has labour or equipment resources assigned to it, its duration may be parametrically derived from the scheduled work of the resource. For example, a labour resource with scheduled work of 10 working days and a resource utilisation of 200% (i.e. two labour teams) will imply that the task duration is 5 working days.

If this data is not available, such as if the task has no resources, then nothing happens.

Parameters:
task (ifcopenshell.entity_instance) – The IfcTask to calculate the duration for.

Returns:
None

Return type:
None

Example:

# Add our own crew

crew = ifcopenshell.api.resource.add_resource(model, ifc_class="IfcCrewResource")

# Add some labour to our crew.

labour = ifcopenshell.api.resource.add_resource(model,
parent_resource=crew, ifc_class="IfcLaborResource")

# Labour resource is quantified in terms of time.

quantity = ifcopenshell.api.resource.add_resource_quantity(model,
resource=labour, ifc_class="IfcQuantityTime")

# Store the unit time used in hours

ifcopenshell.api.resource.edit_resource_quantity(model,
physical_quantity=quantity, attributes={"TimeValue": 8.0})

# Let's imagine we've used the resource for 10 days with a

# utilisation of 200%.

time = ifcopenshell.api.resource.add_resource_time(model, resource=labour)
ifcopenshell.api.resource.edit_resource_time(model,
resource_time=time, attributes={"ScheduleWork": "PT80H", "ScheduleUsage": 2})

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's create a construction task. Note that the predefined type is

# important to distinguish types of tasks.

task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Foundations", identification="A")

# Assign our resource to the task.

ifcopenshell.api.sequence.assign_process(model, relating_process=task, related_object=labour)

# Now we can calculate the task duration based on the resource. This

# will set task.TaskTime.ScheduleDuration to be P5D.

ifcopenshell.api.sequence.calculate_task_duration(model, task=task)
ifcopenshell.api.sequence.cascade_schedule(file: ifcopenshell.file, task: ifcopenshell.entity_instance) → None
Cascades start and end dates of tasks based on durations

Given a start task with a start date and duration, the end date, and the start and end of all successor tasks with durations may be automatically computed.

Using this automatic computation is recommended is an alternative to manually specifying dates. It is useful for doing edits and cascading changes.

Dates can only cascade from predecessor to successors, not backwards. Cyclical relationships are invalid and will result in a recursion error being raised.

Note that there may be differences between how different planning software calculate start and end dates. Some may consider Monday 5pm to be equivalent to be Tuesday 8am, for instance.

Parameters:
task (ifcopenshell.entity_instance) – The start task to begin cascading from.

Returns:
None

Return type:
None

Example:

# Define a convenience function to add a task chained to a predecessor

def add_task(model, name, predecessor, work_schedule): # Add a construction task
task = ifcopenshell.api.sequence.add_task(model,
work_schedule=work_schedule, name=name, predefined_type="CONSTRUCTION")

    # Give it a time
    task_time = ifcopenshell.api.sequence.add_task_time(model, task=task)

    # Arbitrarily set the task's scheduled time duration to be 1 week
    ifcopenshell.api.sequence.edit_task_time(model, task_time=task_time,
        attributes={"ScheduleStart": datetime.date(2000, 1, 1), "ScheduleDuration": "P1W"})

    # If a predecessor exists, create a finish to start relationship
    if predecessor:
        ifcopenshell.api.sequence.assign_sequence(model,
            relating_process=predecessor, related_process=task)

    return task

# Open an existing IFC4 model you have of a building

model = ifcopenshell.open("/path/to/existing/model.ifc")

# Create a new construction schedule

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction")

# Let's imagine a starting task for site establishment.

task = add_task(model, "Site establishment", None, schedule)
start_task = task

# Get all our storeys sorted by elevation ascending.

storeys = sorted(model.by_type("IfcBuildingStorey"), key=lambda s: get_storey_elevation(s))

# For each storey ...

for storey in storeys:

    # Add a construction task to construct that storey, using our convenience function
    task = add_task(model, f"Construct {storey.Name}", task, schedule)

    # Assign all the products in that storey to the task as construction outputs.
    for product in get_decomposition(storey):
        ifcopenshell.api.sequence.assign_product(model, relating_product=product, related_object=task)

# Ask the computer to calculate all the dates for us from the start task.

# For example, if the first task started on the 1st of January and took a

# week, the next task will start on the 8th of January. This saves us

# manually doing date calculations.

ifcopenshell.api.sequence.cascade_schedule(model, task=start_task)

# Calculate the critical path and floats.

ifcopenshell.api.sequence.recalculate_schedule(model, work_schedule=schedule)
ifcopenshell.api.sequence.create_baseline(file: ifcopenshell.file, work_schedule: ifcopenshell.entity_instance, name: str | None = None) → None
Creates a baseline for your Work Schedule

Using a IfcWorkSchdule having PredefinedType=PLANNED, We can create a baseline for our work schedule. This IfcWorkSchedule will have PredefinedType=BASELINE and the IfcWorkSchedule.CreationDate indicating the date of the baseline creation, and IfcWorkSchedule.Name indicating the name of the baseline.

The following relationships are also baselined:

Same Tasks & attributes

Same Task Relationships

Same Construction Resources

Same Resource Relationships

Parameters:
work_schedule (ifcopenshell.entity_instance) – The planned work_schedule to baseline

name (str, optional) – baseline work schedule name

Returns:
The baseline work_schedule

Return type:
ifcopenshell.entity_instance

Example:

# We have a Work Schedule

planned_work_schedule = WorkSchedule(name="Design new feature",predefinedType="PLANNED", deadline="2023-03-01")

# And now we have a baseline for our Work Schedule

baseline_work_schedule = ifcopenshell.api.sequence.create_baseline(file, work_schedule=planned_work_schedule, name="Baseline 1")
ifcopenshell.api.sequence.duplicate_task(file: ifcopenshell.file, task: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Duplicates a task in the project

The following relationships are also duplicated:

The copy will have the same attributes and property sets as the original task

The copy will be assigned to the parent task or work schedule

The copy will have duplicated nested tasks

Parameters:
task (ifcopenshell.entity_instance) – The task to be duplicated

Returns:
The duplicated task or the list of duplicated tasks if the latter has children

Return type:
ifcopenshell.entity_instance or list of ifcopenshell.entity_instance

Example: .. code:: python

# We have a task original_task = Task(name=”Design new feature”, deadline=”2023-03-01”)

# And now we have two duplicated_task = project.duplicate_task(original_task)

ifcopenshell.api.sequence.edit_lag_time(file: ifcopenshell.file, lag_time: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcLagTime

For more information about the attributes and data types of an IfcLagTime, consult the IFC documentation.

Parameters:
lag_time (ifcopenshell.entity_instance) – The IfcLagTime entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's imagine a root construction task

construction = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")

# Let's imagine we're doing a typically formwork, reinforcement,

# pour sequence. Let's start with the formwork. It'll take us 2

# days.

formwork = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Formwork", identification="C.1")
time = ifcopenshell.api.sequence.add_task_time(model, task=formwork)
ifcopenshell.api.sequence.edit_task_time(model,
task_time=time, attributes={"ScheduleStart": "2000-01-01", "ScheduleDuration": "P2D"})

# Now let's do the reinforcement. It'll take us another 2 days.

reinforcement = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Reinforcement", identification="C.2")
time = ifcopenshell.api.sequence.add_task_time(model, task=reinforcement)
ifcopenshell.api.sequence.edit_task_time(model,
task_time=time, attributes={"ScheduleStart": "2000-01-01", "ScheduleDuration": "P2D"})

# Now let's say the formwork must finish before the reinforcement

# can start. This is a typical finish to start relationship (FS).

sequence = ifcopenshell.api.sequence.assign_sequence(model,
relating_process=formwork, related_process=reinforcement)

# Now typically there would be no lag time between formwork and

# reinforcement, but let's pretend that we had to allow 1 day gap

# for whatever reason.

lag = ifcopenshell.api.sequence.assign_lag_time(model, rel_sequence=sequence, lag_value="P1D")

# Or, let's make it 2 days instead.

ifcopenshell.api.sequence.edit_lag_time(model, lag_time=lag, attributes={"LagValue": "P2D"})
ifcopenshell.api.sequence.edit_recurrence_pattern(file: ifcopenshell.file, recurrence_pattern: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcRecurrencePattern

For more information about the attributes and data types of an IfcRecurrencePattern, consult the IFC documentation.

Parameters:
recurrence_pattern (ifcopenshell.entity_instance) – The IfcRecurrencePattern entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model)

# Let's start defining the times that we work during the week.

work_time = ifcopenshell.api.sequence.add_work_time(model,
work_calendar=calendar, time_type="WorkingTimes")

# We create a weekly recurrence

pattern = ifcopenshell.api.sequence.assign_recurrence_pattern(model,
parent=work_time, recurrence_type="WEEKLY")

# State that we work from weekdays 1 to 5 (i.e. Monday to Friday)

ifcopenshell.api.sequence.edit_recurrence_pattern(model,
recurrence_pattern=pattern, attributes={"WeekdayComponent": [1, 2, 3, 4, 5]})
ifcopenshell.api.sequence.edit_sequence(file: ifcopenshell.file, rel_sequence: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcRelSequence

For more information about the attributes and data types of an IfcRelSequence, consult the IFC documentation.

Parameters:
rel_sequence (ifcopenshell.entity_instance) – The IfcRelSequence entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's imagine a root construction task

construction = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")

# Let's imagine we're building 2 zones, one after another.

zone1 = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Zone 1", identification="C.1")
zone2 = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Zone 2", identification="C.2")

# Zone 1 finishes, then zone 2 starts.

sequence = ifcopenshell.api.sequence.assign_sequence(model,
relating_process=zone1, related_process=zone2)

# What if they both started at the same time?

ifcopenshell.api.sequence.edit_sequence(model,
rel_sequence=sequence, attributes={"SequenceType": "START_START"})
ifcopenshell.api.sequence.edit_task(file: ifcopenshell.file, task: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcTask

For more information about the attributes and data types of an IfcTask, consult the IFC documentation.

Parameters:
task (ifcopenshell.entity_instance) – The IfcTask entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Add a root task to represent the design milestones, and major

# project phases.

task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Milestones", identification="A")

# Change the identification

ifcopenshell.api.sequence.edit_task(model, task=task, attributes={"Identification": "M"})
ifcopenshell.api.sequence.edit_task_time(file: ifcopenshell.file, task_time: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcTaskTime

For more information about the attributes and data types of an IfcTaskTime, consult the IFC documentation.

Parameters:
task_time (ifcopenshell.entity_instance) – The IfcTaskTime entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Create a task to do formwork

task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Formwork", identification="A")

# Let's say it takes 2 days and starts on the 1st of January, 2000

time = ifcopenshell.api.sequence.add_task_time(model, task=formwork)
ifcopenshell.api.sequence.edit_task_time(model,
task_time=time, attributes={"ScheduleStart": "2000-01-01", "ScheduleDuration": "P2D"})
ifcopenshell.api.sequence.edit_work_calendar(file: ifcopenshell.file, work_calendar: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcWorkCalendar

For more information about the attributes and data types of an IfcWorkCalendar, consult the IFC documentation.

Parameters:
work_calendar (ifcopenshell.entity_instance) – The IfcWorkCalendar entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model, name="5 Day Week")

# Let's give it a description

ifcopenshell.api.sequence.edit_work_calendar(model,
work_calendar=calendar, attributes={"Description": "Monday to Friday 8 hour days"})
ifcopenshell.api.sequence.edit_work_plan(file: ifcopenshell.file, work_plan: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcWorkPlan

For more information about the attributes and data types of an IfcWorkPlan, consult the IFC documentation.

Parameters:
work_plan (ifcopenshell.entity_instance) – The IfcWorkPlan entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# This will hold all our construction schedules

work_plan = ifcopenshell.api.sequence.add_work_plan(model, name="Construction")

# Let's give it a description

ifcopenshell.api.sequence.edit_work_plan(model,
work_plan=work_plan, attributes={"Description": "Construction of phase 1"})
ifcopenshell.api.sequence.edit_work_schedule(file: ifcopenshell.file, work_schedule: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcWorkSchedule

For more information about the attributes and data types of an IfcWorkSchedule, consult the IFC documentation.

Parameters:
work_schedule (ifcopenshell.entity_instance) – The IfcWorkSchedule entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# This will hold all our construction schedules

work_plan = ifcopenshell.api.sequence.add_work_plan(model, name="Construction")

# Let's imagine this is one of our schedules in our work plan.

schedule = ifcopenshell.api.sequence.add_work_schedule(model,
name="Construction Schedule A", work_plan=work_plan)

# Let's give it a description

ifcopenshell.api.sequence.edit_work_schedule(model,
work_schedule=work_schedule, attributes={"Description": "3 crane design option"})
ifcopenshell.api.sequence.edit_work_time(file: ifcopenshell.file, work_time: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcWorkTime

For more information about the attributes and data types of an IfcWorkTime, consult the IFC documentation.

Parameters:
work_time (ifcopenshell.entity_instance) – The IfcWorkTime entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model)

# Let's start defining the times that we work during the week.

work_time = ifcopenshell.api.sequence.add_work_time(model,
work_calendar=calendar, time_type="WorkingTimes")

# If we don't specify any recurring time periods in our work time,

# we need to specify a start and end date of the work time. It

# starts at 0:00 on the start date and 24:00 at the end date.

ifcopenshell.api.sequence.edit_work_time(model,
work_time=work_time, attributes={"StartDate": "2000-01-01", "FinishDate": "2000-01-02"})
ifcopenshell.api.sequence.remove_task(file: ifcopenshell.file, task: ifcopenshell.entity_instance) → None
Removes a task

All subtasks are also removed recursively. Any relationships such as sequences or controls are also removed.

Parameters:
task (ifcopenshell.entity_instance) – The IfcTask to remove.

Returns:
None

Return type:
None

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Add a root task to represent the design milestones, and major

# project phases.

ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Milestones", identification="A")
design = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Design", identification="B")
ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")

# Ah, let's delete the design section, who needs it anyway we'll

# just fix it on site.

ifcopenshell.api.sequence.remove_task(model, task=design)
ifcopenshell.api.sequence.remove_time_period(file: ifcopenshell.file, time_period: ifcopenshell.entity_instance) → None
Removes a time period

Parameters:
time_period (ifcopenshell.entity_instance) – The IfcTimePeriod to remove.

Returns:
None

Return type:
None

Example:

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model)

# Let's start defining the times that we work during the week.

work_time = ifcopenshell.api.sequence.add_work_time(model,
work_calendar=calendar, time_type="WorkingTimes")

# We create a weekly recurrence

pattern = ifcopenshell.api.sequence.assign_recurrence_pattern(model,
parent=work_time, recurrence_type="WEEKLY")

# State that we work from weekdays 1 to 5 (i.e. Monday to Friday)

ifcopenshell.api.sequence.edit_recurrence_pattern(model,
recurrence_pattern=pattern, attributes={"WeekdayComponent": [1, 2, 3, 4, 5]})

# The morning work session, lunch, then the afternoon work session.

morning = ifcopenshell.api.sequence.add_time_period(model,
recurrence_pattern=pattern, start_time="09:00", end_time="12:00")
afternoon = ifcopenshell.api.sequence.add_time_period(model,
recurrence_pattern=pattern, start_time="13:00", end_time="17:00")

# Let's take the afternoon off!

ifcopenshell.api.sequence.remove_time_period(model, time_period=afternoon)
ifcopenshell.api.sequence.remove_work_calendar(file: ifcopenshell.file, work_calendar: ifcopenshell.entity_instance) → None
Removes a work calendar

All relationships are also removed, such as if a task is set to use that calendar.

Parameters:
work_calendar (ifcopenshell.entity_instance) – The IfcWorkCalendar to remove

Returns:
None

Return type:
None

Example:

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model, name="5 Day Week")

# And remove it immediately

ifcopenshell.api.sequence.remove_work_calendar(model, work_calendar=calendar)
ifcopenshell.api.sequence.remove_work_plan(file: ifcopenshell.file, work_plan: ifcopenshell.entity_instance) → None
Removes a work plan

Note that schedules that are grouped under the work plan are not removed.

Parameters:
work_plan (ifcopenshell.entity_instance) – The IfcWorkPlan to remove.

Returns:
None

Return type:
None

Example:

# This will hold all our construction schedules

work_plan = ifcopenshell.api.sequence.add_work_plan(model, name="Construction")

# And remove it immediately

ifcopenshell.api.sequence.remove_work_plan(model, work_plan=work_plan)
ifcopenshell.api.sequence.remove_work_schedule(file: ifcopenshell.file, work_schedule: ifcopenshell.entity_instance) → None
Removes a work schedule

All tasks in the work schedule are also removed recursively.

Parameters:
work_schedule (ifcopenshell.entity_instance) – The IfcWorkSchedule to remove.

Returns:
None

Return type:
None

Example:

# This will hold all our construction schedules

work_plan = ifcopenshell.api.sequence.add_work_plan(model, name="Construction")

# Let's imagine this is one of our schedules in our work plan.

schedule = ifcopenshell.api.sequence.add_work_schedule(model,
name="Construction Schedule A", work_plan=work_plan)

# And remove it immediately

ifcopenshell.api.sequence.remove_work_schedule(model, work_schedule=schedule)
ifcopenshell.api.sequence.remove_work_time(file: ifcopenshell.file, work_time: ifcopenshell.entity_instance) → None
Removes a work time

Parameters:
work_time (ifcopenshell.entity_instance) – The IfcWorkTime to remove.

Returns:
None

Return type:
None

Example:

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model)

# Let's start defining the times that we work during the week.

work_time = ifcopenshell.api.sequence.add_work_time(model,
work_calendar=calendar, time_type="WorkingTimes")

# And remove it immediately

ifcopenshell.api.sequence.remove_work_time(model, work_time=work_time)
ifcopenshell.api.sequence.unassign_lag_time(file: ifcopenshell.file, rel_sequence: ifcopenshell.entity_instance) → None
Removes any lag time in a sequence

The schedule is cascaded afterwards.

Parameters:
rel_sequence (ifcopenshell.entity_instance) – The sequence to remove the lag time from.

Returns:
None

Return type:
None

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's imagine a root construction task

construction = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")

# Let's imagine we're building 2 zones, one after another.

zone1 = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Zone 1", identification="C.1")
zone2 = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Zone 2", identification="C.2")

# Zone 1 finishes, then zone 2 starts.

sequence = ifcopenshell.api.sequence.assign_sequence(model,
relating_process=zone1, related_process=zone2)

# What if you had to wait 1 week before you could start zone 2?

ifcopenshell.api.sequence.assign_lag_time(model, rel_sequence=sequence, lag_value="P1W")

# What if you didn't?

ifcopenshell.api.sequence.unassign_lag_time(model, rel_sequence=sequence)
ifcopenshell.api.sequence.unassign_process(file: ifcopenshell.file, relating_process: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → None
Unassigns a process and object relationship

See ifcopenshell.api.sequence.assign_process for details.

Parameters:
relating_process (ifcopenshell.entity_instance) – The IfcTask in the relationship.

related_object (ifcopenshell.entity_instance) – The related object.

Returns:
None

Return type:
None

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's create a construction task. Note that the predefined type is

# important to distinguish types of tasks.

task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Demolish existing", identification="A", predefined_type="DEMOLITION")

# Let's say we have a wall somewhere.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Let's demolish that wall!

ifcopenshell.api.sequence.assign_process(model, relating_process=task, related_object=wall)

# Change our mind.

ifcopenshell.api.sequence.unassign_process(model, relating_process=task, related_object=wall)
ifcopenshell.api.sequence.unassign_product(file: ifcopenshell.file, relating_product: ifcopenshell.entity_instance, related_object: ifcopenshell.entity_instance) → None
Unassigns a product and object relationship

See ifcopenshell.api.sequence.assign_product for details.

Parameters:
relating_product (ifcopenshell.entity_instance) – The IfcProduct in the relationship.

related_object (ifcopenshell.entity_instance) – The IfcTask in the relationship.

Returns:
None

Return type:
None

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's create a construction task. Note that the predefined type is

# important to distinguish types of tasks.

task = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Build wall", identification="A", predefined_type="CONSTRUCTION")

# Let's say we have a wall somewhere.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Let's construct that wall!

ifcopenshell.api.sequence.assign_product(relating_product=wall, related_object=task)

# Change our mind.

ifcopenshell.api.sequence.unassign_product(relating_product=wall, related_object=task)
ifcopenshell.api.sequence.unassign_recurrence_pattern(file: ifcopenshell.file, recurrence_pattern: ifcopenshell.entity_instance) → None
Unassigns a recurrence pattern

Note that a recurring task time must have a recurrence pattern, so if you remove it, be sure to clean up after this API call (e.g. remove IfcTaskTimeRecurring entity or assign a different recurrence patern to it or replace IfcTaskTimeRecurring with IfcTaskTime).

Parameters:
recurrence_pattern (ifcopenshell.entity_instance) – The IfcRecurrencePattern to remove.

Returns:
None

Return type:
None

Example:

# Let's create a new calendar.

calendar = ifcopenshell.api.sequence.add_work_calendar(model)

# Let's start defining the times that we work during the week.

work_time = ifcopenshell.api.sequence.add_work_time(model,
work_calendar=calendar, time_type="WorkingTimes")

# We create a weekly recurrence

pattern = ifcopenshell.api.sequence.assign_recurrence_pattern(model,
parent=work_time, recurrence_type="WEEKLY")

# Change our mind, let's just maintain it whenever we feel like it.

ifcopenshell.api.sequence.unassign_recurrence_pattern(recurrence_pattern=pattern)
ifcopenshell.api.sequence.unassign_sequence(file: ifcopenshell.file, relating_process: ifcopenshell.entity_instance, related_process: ifcopenshell.entity_instance) → None
Removes a sequence relationship between tasks

Parameters:
relating_process (ifcopenshell.entity_instance) – The previous / predecessor task.

related_process (ifcopenshell.entity_instance) – The next / successor task.

Returns:
None

Return type:
None

Example:

# Let's imagine we are creating a construction schedule. All tasks

# need to be part of a work schedule.

schedule = ifcopenshell.api.sequence.add_work_schedule(model, name="Construction Schedule A")

# Let's imagine a root construction task

construction = ifcopenshell.api.sequence.add_task(model,
work_schedule=schedule, name="Construction", identification="C")

# Let's imagine we're building 2 zones, one after another.

zone1 = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Zone 1", identification="C.1")
zone2 = ifcopenshell.api.sequence.add_task(model,
parent_task=construction, name="Zone 2", identification="C.2")

# Zone 1 finishes, then zone 2 starts.

ifcopenshell.api.sequence.assign_sequence(model, relating_process=zone1, related_process=zone2)

# Let's make them unrelated

ifcopenshell.api.sequence.unassign_sequence(model,
relating_process=zone1, related_process=zone2)

ifcopenshell.api.spatial
Assign spatial relationships such as when an element is in a space

Physical elements (walls, doors, etc) may be contained in or reference spatial elements (spaces, storeys, buildings, etc).

Submodules
ifcopenshell.api.spatial.assign_container
ifcopenshell.api.spatial.dereference_structure
ifcopenshell.api.spatial.reference_structure
ifcopenshell.api.spatial.unassign_container
Package Contents
ifcopenshell.api.spatial.assign_container(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], relating_structure: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Assigns products to be contained hierarchically in a space

All physical IFC model elements must be part of a hierarchical tree called the “spatial decomposition”, where large things are made up of smaller things. This tree always begins at an “IfcProject” and is then broken down using “decomposition” relationships, of which aggregation is the first relationship you will use. See ifcopenshell.api.aggregate.assign_object for more details about aggregation.

The IfcProject will be “decomposed” into spatial structure elements. These are virtual spaces like stes, buildings, storeys, and spaces (i.e. rooms). You can’t physically touch these spaces, but you can touch the products contained within these spaces.

To state that a product is contained in a space, you will use a “containment” relationship. Containment is a very common relationship used to create the hierarchical spatial decomposition tree. For example, you might say that “This wall is on the third building storey”, or “this table is in the living room space”.

The distinguishing factor between aggregation and containment is that aggregation occurs between objects of the same type (e.g. a large space is made up of smaller spaces), whereas containment is between two different types: explicitly saying that a physical product exists within a virtual space.

Containment is critical in construction management, to know which objects are in which spaces, as often you would divide your construction schedule into storey by storey, or zone by zone. Containment is also critical in facility management, as it indicates through which space equipment may be accessed for maintenance purposes.

As a product may only have a single location in the “spatial decomposition” tree, assigning an aggregate relationship will remove any previous aggregation, containment, or nesting relationships it may have.

Parameters:
products (list[ifcopenshell.entity_instance]) – A list of physical IfcElements existing in the space.

relating_structure – The IfcSpatialStructureElement element, such as IfcBuilding, IfcBuildingStorey, or IfcSpace that the element exists in.

Returns:
The IfcRelContainedInSpatialStructure relationship instance or None if products was empty list.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")
site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite")
building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")
storey = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey")
space = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSpace")

# The project contains a site (note that project aggregation is a special case in IFC)

ifcopenshell.api.aggregate.assign_object(model, products=[site], relating_object=project)

# The site has a building, the building has a storey, and the storey has a space

ifcopenshell.api.aggregate.assign_object(model, products=[building], relating_object=site)
ifcopenshell.api.aggregate.assign_object(model, products=[storey], relating_object=building)
ifcopenshell.api.aggregate.assign_object(model, products=[space], relating_object=storey)

# Create a wall and furniture

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
furniture = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")

# The wall is in the storey, and the furniture is in the space

ifcopenshell.api.spatial.assign_container(model, products=[wall], relating_structure=storey)
ifcopenshell.api.spatial.assign_container(model, products=[furniture], relating_structure=space)
ifcopenshell.api.spatial.dereference_structure(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], relating_structure: ifcopenshell.entity_instance) → None
Dereferences a list of products and space

Parameters:
products (list[ifcopenshell.entity_instance]) – The list of physical IfcElements that exists in the space.

relating_structure – The IfcSpatialStructureElement element, such as IfcBuilding, IfcBuildingStorey, or IfcSpace that the element exists in.

Returns:
None

Return type:
None

Example:

project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")
site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite")
building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")
storey1 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey")
storey2 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey")
storey3 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey")

# The project contains a site (note that project aggregation is a special case in IFC)

ifcopenshell.api.aggregate.assign_object(model, products=[site], relating_object=project)

# The site has a building, the building has a storey, and the storey has a space

ifcopenshell.api.aggregate.assign_object(model, products=[building], relating_object=site)
ifcopenshell.api.aggregate.assign_object(model, products=[storey], relating_object=building)
ifcopenshell.api.aggregate.assign_object(model, products=[space], relating_object=storey)

# Create a column, this column spans 3 storeys

column = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# The column is contained in the lowermost storey

ifcopenshell.api.spatial.assign_container(model, products=[column], relating_structure=storey1)

# And referenced in the others

ifcopenshell.api.spatial.reference_structure(model, products=[column], relating_structure=storey2)
ifcopenshell.api.spatial.reference_structure(model, products=[column], relating_structure=storey3)

# Actually, it only goes up to storey 2.

ifcopenshell.api.spatial.dereference_structure(model, products=[column], relating_structure=storey3)
ifcopenshell.api.spatial.reference_structure(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], relating_structure: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Denote that a list products is related to a list of spatial structures

This is similar to ifcopenshell.api.spatial.assign_container, except that containment can only occur between a product and a single spatial structure element. This is fine if a wall is on level 1, but not appropriate if you have a multistorey column on multiple levels, or a door with a to and from space, or a stair going from one floor to another floor. This is where spatial referencing is used.

Typically, the product will be contained in the lowermost, constructed first, or primarily accessible space. For a multistorey column or stair, the column or stair will therefore be contained in the lowermost storey. Then, any other storeys will be referenced.

Referencing is non-hierarchical, so a door may be referenced in multiple spaces simultaneously.

Parameters:
products (list[ifcopenshell.entity_instance]) – The list of physical IfcElements that exists in the space.

relating_structure (ifcopenshell.entity_instance) – The IfcSpatialStructureElement element, such as IfcBuilding, IfcBuildingStorey, or IfcSpace that the element exists in.

Returns:
The IfcRelReferencedInSpatialStructure relationship instance or None if products was an empty list.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")
site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite")
building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")
storey1 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey")
storey2 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey")
storey3 = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey")

# The project contains a site (note that project aggregation is a special case in IFC)

ifcopenshell.api.aggregate.assign_object(model, products=[site], relating_object=project)

# The site has a building, the building has a storey, and the storey has a space

ifcopenshell.api.aggregate.assign_object(model, products=[building], relating_object=site)
ifcopenshell.api.aggregate.assign_object(model, products=[storey], relating_object=building)
ifcopenshell.api.aggregate.assign_object(model, products=[space], relating_object=storey)

# Create a column, this column spans 3 storeys

column = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# The column is contained in the lowermost storey

ifcopenshell.api.spatial.assign_container(model, products=[column], relating_structure=storey1)

# And referenced in the others

ifcopenshell.api.spatial.reference_structure(
model, products=[column], relating_structure=[storey2, storey3]
)
ifcopenshell.api.spatial.unassign_container(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance]) → None
Unassigns a container from products.

Parameters:
product (list[ifcopenshell.entity_instance]) – A list of IfcProducts to remove the containment from.

Returns:
None

Return type:
None

Example:

project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")
site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite")
building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding")
storey = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey")

# The project contains a site (note that project aggregation is a special case in IFC)

ifcopenshell.api.aggregate.assign_object(model, products=[site], relating_object=project)

# The site has a building, the building has a storey, and the storey has a space

ifcopenshell.api.aggregate.assign_object(model, products=[building], relating_object=site)
ifcopenshell.api.aggregate.assign_object(model, products=[storey], relating_object=building)

# Create a wall

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# The wall is in the storey

ifcopenshell.api.spatial.assign_container(model, products=[wall], relating_structure=storey)

# Not anymore!

ifcopenshell.api.spatial.unassign_container(model, products=[wall])

ifcopenshell.api.structural
Manage analytical properties for structural simulation

This only handles authoring the analytical model, and does not actually perform any structural simulation. To perform the simulation, see IFC2CA.

Submodules
ifcopenshell.api.structural.add_structural_activity
ifcopenshell.api.structural.add_structural_analysis_model
ifcopenshell.api.structural.add_structural_boundary_condition
ifcopenshell.api.structural.add_structural_load
ifcopenshell.api.structural.add_structural_load_case
ifcopenshell.api.structural.add_structural_load_group
ifcopenshell.api.structural.add_structural_member_connection
ifcopenshell.api.structural.assign_structural_analysis_model
ifcopenshell.api.structural.edit_structural_analysis_model
ifcopenshell.api.structural.edit_structural_boundary_condition
ifcopenshell.api.structural.edit_structural_connection_cs
ifcopenshell.api.structural.edit_structural_item_axis
ifcopenshell.api.structural.edit_structural_load
ifcopenshell.api.structural.edit_structural_load_case
ifcopenshell.api.structural.remove_structural_analysis_model
ifcopenshell.api.structural.remove_structural_boundary_condition
ifcopenshell.api.structural.remove_structural_connection_condition
ifcopenshell.api.structural.remove_structural_load
ifcopenshell.api.structural.remove_structural_load_case
ifcopenshell.api.structural.remove_structural_load_group
ifcopenshell.api.structural.unassign_structural_analysis_model
Package Contents
ifcopenshell.api.structural.add_structural_activity(file: ifcopenshell.file, applied_load: ifcopenshell.entity_instance, structural_member: ifcopenshell.entity_instance, ifc_class: str = 'IfcStructuralPlanarAction', predefined_type: str = 'CONST', global_or_local: Literal['GLOBAL_COORDS', 'LOCAL_COORDS'] = 'GLOBAL_COORDS') → None
Adds a new structural activity

A structural activity is either a structural action or a reaction. It may be applied to a point, a curve, or a planar surface, and may be a constant load, linear, etc.

The activity must be defined using an applied load, and associated with a structural member.

Parameters:
ifc_class (str) – Choose from any subtype of IfcStructuralActivity.

predefined_type (str) – View the IFC documentation for what valid predefined types may be chosen.

global_or_local (str) – The location coordinates of the load is always defined locally relative to the structural member the activity is assigned to. However, the directions of the applied load may either be specified globally or locally depending on how this argument is set. Choose from GLOBAL_COORDS or LOCAL_COORDS.

applied_load (ifcopenshell.entity_instance) – The IfcStructuralLoad that is applied in this activity.

structural_member (ifcopenshell.entity_instance) – The IfcStructuralMember that the load is applied to.

Returns:
The newly created entity based on the ifc_class

Return type:
ifcopenshell.entity_instance

ifcopenshell.api.structural.add_structural_analysis_model(file: ifcopenshell.file) → ifcopenshell.entity_instance
Add a new structural analysis model

A structural analysis model is a group of all the loads, reactions, structural members, and structural connections required to describe a structural analysis model.

A 3D analytical model is assumed.

Returns:
The newly created IfcStructuralAnalysisModel

Return type:
ifcopenshell.entity_instance

Example:

# Create a fresh blank structural analysis

analysis = ifcopenshell.api.structural.add_structural_analysis_model(model)
ifcopenshell.api.structural.add_structural_boundary_condition(file: ifcopenshell.file, name: str | None = None, connection: ifcopenshell.entity_instance | None = None, ifc_class: str = 'IfcBoundaryNodeCondition') → ifcopenshell.entity_instance
Adds a new structural boundary condition to a structural connection

The type of boundary condition depends on the connection. Point connections will have a node condition, curve connections will have an edge condition, and surface connections will have a face condition.

Parameters:
name (str,optional) – The name of the boundary condition.

connection (ifcopenshell.entity_instance,optional) – The IfcStructuralConnection to apply the boundary condition to. This will determine the type of condition that is created. If no connection is supplied, an orphan boundary condition will be created using the ifc_class that you specify.

ifc_class (str,optional) – The class of IfcBoundaryCondition to create, only relevant if you do not specify a connection and want to create an orphaned boundary condition.

Returns:
The newly created IfcBoundaryCondition

Return type:
ifcopenshell.entity_instance

Example:

ifcopenshell.api.structural.add_structural_boundary_condition(model, connection=connection)
ifcopenshell.api.structural.add_structural_load(file: ifcopenshell.file, name: str | None = None, ifc_class: str = 'IfcStructuralLoadLinearForce') → ifcopenshell.entity_instance
Adds a new structural load

Structural loads may be actions or reactions. A simple load might be a static and be linear, planar, or a single point. Alternatively, loads may be defined as a configuration of multiple loads.

Parameters:
name (str,optional) – The name of the load

ifc_class (str) – The subtype of IfcStructuralLoad to create. Consult the IFC documentation to see all the types of loads.

Returns:
The newly created load entity, depending on the ifc_class specified.

Return type:
ifcopenshell.entity_instance

Example:

# Create a simple linear load

ifcopenshell.api.structural.add_structural_load(model)
ifcopenshell.api.structural.add_structural_load_case(file: ifcopenshell.file, name: str = 'Unnamed', action_type: str = 'NOTDEFINED', action_source: str = 'NOTDEFINED') → ifcopenshell.entity_instance
Adds a new load case, which is a collection of related load groups

Parameters:
name (str) – The name of the load case

action_type (str) – Choose from EXTRAORDINARY_A, PERMANENT_G, or VARIABLE_Q, taken from the Eurocode standard.

action_source (str) – The source of the load case, such as DEAD_LOAD_G, LIVE_LOAD_Q, TRANSPORT, ICE, etc. For the full list consult IfcActionSourceTypeEnum in the IFC documentation.

Returns:
The new IfcStructuralLoadCase

Return type:
ifcopenshell.entity_instance

ifcopenshell.api.structural.add_structural_load_group(file: ifcopenshell.file, name: str = 'Unnamed', action_type: str = 'NOTDEFINED', action_source: str = 'NOTDEFINED') → ifcopenshell.entity_instance
Adds a new load group, which is a collection of related loads

Parameters:
name (str) – The name of the load group

action_type (str) – Choose from EXTRAORDINARY_A, PERMANENT_G, or VARIABLE_Q, taken from the Eurocode standard.

action_source (str) – The source of the load case, such as DEAD_LOAD_G, LIVE_LOAD_Q, TRANSPORT, ICE, etc. For the full list consult IfcActionSourceTypeEnum in the IFC documentation.

Returns:
The new IfcStructuralLoadCase

Return type:
ifcopenshell.entity_instance

ifcopenshell.api.structural.add_structural_member_connection(file: ifcopenshell.file, relating_structural_member: ifcopenshell.entity_instance, related_structural_connection: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Relates a structural member and a structural connection

Parameters:
relating_structural_member (ifcopenshell.entity_instance) – The IfcStructuralMember to have a connection added to it.

related_structural_connection (ifcopenshell.entity_instance) – The IfcStructuralConnection to add to the IfcStructuralMember.

Returns:
The IfcRelConnectsStructuralMember relationship

Return type:
ifcopenshell.entity_instance

ifcopenshell.api.structural.assign_structural_analysis_model(file: ifcopenshell.file, product: ifcopenshell.entity_instance, structural_analysis_model: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Assigns a load or structural member to an analysis model

Parameters:
product (ifcopenshell.entity_instance) – The structural element that is part of the analysis.

structural_analysis_model (ifcopenshell.entity_instance) – The IfcStructuralAnalysisModel that the structural element is related to.

Returns:
The IfcRelAssignsToGroup relationship

Return type:
ifcopenshell.entity_instance

ifcopenshell.api.structural.edit_structural_analysis_model(file: ifcopenshell.file, structural_analysis_model: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcStructuralAnalysisModel

For more information about the attributes and data types of an IfcStructuralAnalysisModel, consult the IFC documentation.

Parameters:
structural_analysis_model (ifcopenshell.entity_instance) – The IfcStructuralAnalysisModel entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

ifcopenshell.api.structural.edit_structural_boundary_condition(file: ifcopenshell.file, condition: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcBoundaryCondition

For more information about the attributes and data types of an IfcBoundaryCondition, consult the IFC documentation.

Parameters:
condition (ifcopenshell.entity_instance) – The IfcBoundaryCondition entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

ifcopenshell.api.structural.edit_structural_connection_cs(file: ifcopenshell.file, structural_item: ifcopenshell.entity_instance, axis: tuple[float, float, float] = (0.0, 0.0, 1.0), ref_direction: tuple[float, float, float] = (1.0, 0.0, 0.0)) → None
Edits the coordinate system of a structural connection

Parameters:
structural_item (ifcopenshell.entity_instance) – The IfcStructuralItem you want to modify.

axis (tuple[float, float, float]) – The unit Z axis vector defined as a list of 3 floats. Defaults to (0., 0., 1.).

ref_direction (tuple[float, float, float]) – The unit X axis vector defined as a list of 3 floats. Defaults to (1., 0., 0.).

Returns:
None

Return type:
None

ifcopenshell.api.structural.edit_structural_item_axis(file: ifcopenshell.file, structural_item: ifcopenshell.entity_instance, axis: tuple[float, float, float] = (0.0, 0.0, 1.0)) → None
Edits the coordinate system of a structural connection

Parameters:
structural_item (ifcopenshell.entity_instance) – The IfcStructuralItem you want to modify.

axis (tuple[float, float, float]) – The unit Z axis vector defined as a list of 3 floats. Defaults to (0., 0., 1.).

Returns:
None

Return type:
None

ifcopenshell.api.structural.edit_structural_load(file: ifcopenshell.file, structural_load: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcStructuralLoad

For more information about the attributes and data types of an IfcStructuralLoad, consult the IFC documentation.

Parameters:
structural_load (ifcopenshell.entity_instance) – The IfcStructuralLoad entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

ifcopenshell.api.structural.edit_structural_load_case(file: ifcopenshell.file, load_case: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcStructuralLoadCase

For more information about the attributes and data types of an IfcStructuralLoadCase, consult the IFC documentation.

Parameters:
load_case (ifcopenshell.entity_instance) – The IfcStructuralLoadCase entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

ifcopenshell.api.structural.remove_structural_analysis_model(file: ifcopenshell.file, structural_analysis_model: ifcopenshell.entity_instance) → None
Removes an analysis model

Note that the contents of an analysis model are currently preserved.

Parameters:
structural_analysis_model (ifcopenshell.entity_instance) – The IfcStructuralAnalysisModel to remove.

Returns:
None

Return type:
None

ifcopenshell.api.structural.remove_structural_boundary_condition(file: ifcopenshell.file, connection: ifcopenshell.entity_instance | None = None, boundary_condition: ifcopenshell.entity_instance | None = None) → None
Removes a condition from a connection, or an orphased boundary condition

Parameters:
connection (ifcopenshell.entity_instance,optional) – The IfcStructuralConnection to remove the condition from. If omitted, it is assumed to be an orphaned condition.

boundary_condition (ifcopenshell.entity_instance, optional.) – The IfcBoundaryCondition to remove.

Returns:
None

Return type:
None

ifcopenshell.api.structural.remove_structural_connection_condition(file: ifcopenshell.file, relation: ifcopenshell.entity_instance) → None
Removes a relationship between a connection and a condition

The condition and the member itself is preserved.

Parameters:
relation (ifcopenshell.entity_instance) – The IfcRelConnectsStructuralMember to remove.

Returns:
None

Return type:
None

ifcopenshell.api.structural.remove_structural_load(file: ifcopenshell.file, structural_load: ifcopenshell.entity_instance) → None
Removes a structural load

Parameters:
structural_load (ifcopenshell.entity_instance) – The IfcStructuralLoad to remove.

Returns:
None

Return type:
None

ifcopenshell.api.structural.remove_structural_load_case(file: ifcopenshell.file, load_case: ifcopenshell.entity_instance) → None
Removes a structural load case

Parameters:
load_case (ifcopenshell.entity_instance) – The IfcStructuralLoadCase to remove.

Returns:
None

Return type:
None

ifcopenshell.api.structural.remove_structural_load_group(file: ifcopenshell.file, load_group: ifcopenshell.entity_instance) → None
Removes a structural load group

Parameters:
load_group (ifcopenshell.entity_instance) – The IfcStructuralLoadGroup to remove.

Returns:
None

Return type:
None

ifcopenshell.api.structural.unassign_structural_analysis_model(file: ifcopenshell.file, product: ifcopenshell.entity_instance, structural_analysis_model: ifcopenshell.entity_instance) → None
Removes a relationship between a structural element and the analysis model

Parameters:
product (ifcopenshell.entity_instance) – The structural element that is part of the analysis.

structural_analysis_model (ifcopenshell.entity_instance) – The IfcStructuralAnalysisModel that the structural element is related to.

Returns:
None

Return type:
None

ifcopenshell.api.style
Manage visual styles of geometry (colours, transparency, rendering, etc)

Geometry may have visual styles associated with it, including surface styles, 2D curve styles, text styles, and more. Surface styles are most commonly used for simple colouring.

Submodules
ifcopenshell.api.style.add_style
ifcopenshell.api.style.add_surface_style
ifcopenshell.api.style.add_surface_textures
ifcopenshell.api.style.assign_material_style
ifcopenshell.api.style.assign_representation_styles
ifcopenshell.api.style.edit_presentation_style
ifcopenshell.api.style.edit_surface_style
ifcopenshell.api.style.remove_style
ifcopenshell.api.style.remove_styled_representation
ifcopenshell.api.style.remove_surface_style
ifcopenshell.api.style.unassign_material_style
ifcopenshell.api.style.unassign_representation_styles
Package Contents
ifcopenshell.api.style.add_style(file: ifcopenshell.file, name: str | None = None, ifc_class='IfcSurfaceStyle') → ifcopenshell.entity_instance
Add a new presentation style

A presentation style is a container of visual settings (called presentation items) that affect the appearance of objects. There are four types of style:

Surface styles, which give 3D objects (which have surfaces / faces) their colours and textures. This is the most common type of style.

Curve styles, which give 2D and 3D curves, lines, polylines, their stroke thickness and colour.

Fill area styles, which gives 2D polygons and flat 3D planes their colours, hatch patterns, tiled patterns, and pattern scales.

Text styles, which gives text their font family, weight, variant, size, indentation, alignment, decoration, spacing, and transformation.

Once you have created a presentation style object, you can further define the properties of your style using other API functions by adding presentation items, such as ifcopenshell.api.style.add_surface_style.

Parameters:
name (str,optional) – The name of the style. Used to easily identify it using a style library.

ifc_class (str) – Choose from IfcSurfaceStyle, IfcCurveStyle, IfcFillAreaStyle, or IfcTextStyle.

Returns:
The newly created style element, based on the provided ifc_class.

Return type:
ifcopenshell.entity_instance

Example:

# Create a new surface style

style = ifcopenshell.api.style.add_style(model)
ifcopenshell.api.style.add_surface_style(file: ifcopenshell.file, style: ifcopenshell.entity_instance, ifc_class: SURFACE_STYLE_TYPES = 'IfcSurfaceStyleShading', attributes: dict[str, Any] | None = None) → None
Adds a new presentation item to a surface style

A surface style can have multiple different types of presentation items assigned to it:

Shading, this is the simplest item, which defines a single basic colour and transparency that can be used to display the object on a screen. It is an indicative colour of what the object would be in real life. It is commonly incorrectly abused to colour code systems for MEP equipment or object types for structural steel. If you just want to give something a colour, this is what you need.

Rendering, this is an advanced extension of shading, which includes the definition of a shader for a rendering engine. You may select the reflectance / lighting model such as PHYSICAL, for PBR style rendering, or FLAT, for flat shading, or PHONG for older biased rendering workflows. Based on the chosen lighting model, you may then specify the appropriate colour maps, such as diffuse colours, specularity, emissive component, etc. These lighting models are fully compatible with glTF and X3D. This should be used if your model is prepared to be rendered by a rendering engine which is compatible with glTF / X3D shader descriptions. If you are doing archviz or 3D rendering, this is what you need.

Textures, this is a special type of Rendering presentation item that uses image textures instead of single colours. Textures may be either mapped using a bounding box stretch mapping, or with UV coordinates for mesh-like geometry.

Lighting, this is used to define photometrically accurate colour parameters used in lighting simulation. If you are a simulationist, this is what you need.

Reflectance, this is a special type of Lighting presentation item which includes some lesser used photometric properties, typically required for advanced materials like glazing.

External, this is for any other surface style defined using an external URI. This is relevant if you are using a third-party non-glTF compatible shader definition such as for Cycles, Renderman, V-Ray, etc, or a complex lighting simulation definition, such as for Radiance.

Shading is sufficient for the majority of basic models.

The attributes you specify will depend on the type of presentation item you are adding. An example is shown below, but for full details please refer to the IFC documentation.

Parameters:
style (ifcopenshell.entity_instance) – The IfcSurfaceStyle you want to add to presentation item to. See ifcopenshell.api.style.add_style.

ifc_class (str) – Choose from IfcSurfaceStyleShading, IfcSurfaceStyleRendering, IfcSurfaceStyleWithTextures, IfcSurfaceStyleLighting, IfcSurfaceStyleReflectance, or IfcExternallyDefinedSurfaceStyle.

attributes (dict, optional) – a dictionary of attribute names and values.

Returns:
The newly created presentation item based on the provided ifc_class.

Return type:
ifcopenshell.entity_instance

Example:

# Create a new surface style

style = ifcopenshell.api.style.add_style(model)

# Create a simple shading colour and transparency.

ifcopenshell.api.style.add_surface_style(model,
style=style, ifc_class="IfcSurfaceStyleShading", attributes={
"SurfaceColour": { "Name": None, "Red": 1.0, "Green": 0.8, "Blue": 0.8 },
"Transparency": 0., # 0 is opaque, 1 is transparent
})

# Alternatively, create a rendering style.

ifcopenshell.api.style.add_surface_style(model,
style=style, ifc_class="IfcSurfaceStyleRendering", attributes={ # A surface colour and transparency is still supplied for # viewport display only. This will supersede the shading # presentation item.
"SurfaceColour": { "Name": None, "Red": 1.0, "Green": 0.8, "Blue": 0.8 },
"Transparency": 0., # 0 is opaque, 1 is transparent

        # NOTDEFINED is assumed to be a PHYSICAL (PBR) lighting
        # model. In IFC4X3, you may choose PHYSICAL directly.
        "ReflectanceMethod": "NOTDEFINED",

        # For PBR shading, you may specify these parameters:
        "DiffuseColour": { "Name": None, "Red": 0.9, "Green": 0.8, "Blue": 0.8 },
        "SpecularColour": 0.1, # Metallic factor
        "SpecularHighlight": {"SpecularRoughness": 0.5}, # Roughness factor
    })

ifcopenshell.api.style.add_surface_textures(file: ifcopenshell.file, material: bpy.types.Material | None = None, textures: list[dict] | None = None, uv_maps: list[ifcopenshell.entity_instance] | None = None) → list[ifcopenshell.entity_instance]
Add surface texture based on a Blender material definition or texture data.

Either material or textures should be provided.

Parameters:
material (bpy.types.Material, optional) – The Blender material definition with a node tree that is compatible with glTF. See one of the valid combinations here: https://docs.blender.org/manual/en/dev/addons/import_export/scene_gltf2.html

uv_maps (list[ifcopenshell.entity_instance]) – A list of IfcIndexedTextureMap for any IfcTessellatedFaceSets that the representation has, obtained from the HasTextures attribute.

textures (list[dict], optional) –

A list of dictionaries containing:

Attributes to create IfcImageTexture.

One additional parameter uv_mode to map IfcImageTexture to correct IfcTextureCoordinate type.

Possible uv_mode values:

UV - use IfcTextureCoordinate from uv_maps parameter;

Generated - IfcTextureCoordinateGenerator with mode COORD (autogenerated UV based on geometry);

Camera - IfcTextureCoordinateGenerator with mode COORD_EYE (autogenerated UV based on camera position)

Returns:
A list of IfcImageTexture

Return type:
list[ifcopenshell.entity_instance]

ifcopenshell.api.style.assign_material_style(file: ifcopenshell.file, material: ifcopenshell.entity_instance, style: ifcopenshell.entity_instance, context: ifcopenshell.entity_instance, should_use_presentation_style_assignment: bool = False) → None
Assigns a style to a material

A style may either be assigned directly to an object’s representation, or to a material which is then associated with the object. If both exist, then the style assigned directly to the object’s representation takes precedence. It is recommended to use materials and assign styles to materials. This API function provides that capability.

Parameters:
material (ifcopenshell.entity_instance) – The IfcMaterial which you want to assign the style to.

style (ifcopenshell.entity_instance) – The IfcPresentationStyle (typically IfcSurfaceStyle) that you want to assign to the material. This will then be applied to all objects that have that material.

context (ifcopenshell.entity_instance) – The IfcGeometricRepresentationSubContext at which this style should be used. Typically this is the Model BODY context.

should_use_presentation_style_assignment (bool) – This is a technical detail to accomodate a bug in Revit. This should always be left as the default of False, unless you are finding that colours aren’t showing up in Revit. In that case, set it to True, but keep in mind that this is no longer a valid IFC. Blame Autodesk.

Returns:
None

Return type:
None

Example:

# A model context is needed to store 3D geometry

model3d = ifcopenshell.api.context.add_context(model, context_type="Model")

# Specifically, we want to store body geometry

body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

# Let's create a new wall. The wall does not have any geometry yet.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Let's use the "3D Body" representation we created earlier to add a

# new wall-like body geometry, 5 meters long, 3 meters high, and

# 200mm thick

representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=5, height=3, thickness=0.2)

# Assign our new body geometry back to our wall

ifcopenshell.api.geometry.assign_representation(model,
product=wall, representation=representation)

# Place our wall at the origin

ifcopenshell.api.geometry.edit_object_placement(model, product=wall)

# Let's prepare a concrete material. Note that our concrete material

# does not have any colours (styles) at this point.

concrete = ifcopenshell.api.material.add_material(model, name="CON01", category="concrete")

# Assign our concrete material to our wall

ifcopenshell.api.material.assign_material(model,
products=[wall], type="IfcMaterial", material=concrete)

# Create a new surface style

style = ifcopenshell.api.style.add_style(model)

# Create a simple grey shading colour and transparency.

ifcopenshell.api.style.add_surface_style(model,
style=style, ifc_class="IfcSurfaceStyleShading", attributes={
"SurfaceColour": { "Name": None, "Red": 0.5, "Green": 0.5, "Blue": 0.5 },
"Transparency": 0., # 0 is opaque, 1 is transparent
})

# Now any element (like our wall) with a concrete material will have

# a grey colour applied.

ifcopenshell.api.style.assign_material_style(model, material=concrete, style=style, context=body)
ifcopenshell.api.style.assign_representation_styles(file: ifcopenshell.file, shape_representation: ifcopenshell.entity_instance, styles: list[ifcopenshell.entity_instance], replace_previous_same_type_style: bool = True, should_use_presentation_style_assignment: bool = False) → list[ifcopenshell.entity_instance]
Assigns a style directly to an object representation

A style may either be assigned directly to an object’s representation, or to a material which is then associated with the object. If both exist, then the style assigned directly to the object’s representation takes precedence. It is recommended to use materials and assign styles to materials. However, sometimes you may want to assign colours directly to the object representation as an override. This API function provides that capability.

If you want to assign styles to a material instead (recommended), then please see ifcopenshell.api.style.assign_material_style.

Parameters:
shape_representation (ifcopenshell.entity_instance) – The IfcShapeRepresentation of the object that you want to assign styles to. This implicitly defines the context at which the styles should be used.

styles (list[ifcopenshell.entity_instance]) – A list of presentation styles, typically IfcSurfaceStyle. The number of items in the list should correlate with the number of items in the shape_representation’s Items attribute. If you have more items than styles, the last style is used.

replace_previous_same_type_style (bool) – Remove previously assigned styles of the same type as currently assign style`. Defaults to True.

should_use_presentation_style_assignment (bool) – This is a technical detail to accomodate a bug in Revit. This should always be left as the default of False, unless you are finding that colours aren’t showing up in Revit. In that case, set it to True, but keep in mind that this is no longer a valid IFC. Blame Autodesk.

Returns:
List of created IfcStyledItems

Return type:
list[ifcopenshell.entity_instance]

Example:

# A model context is needed to store 3D geometry

model3d = ifcopenshell.api.context.add_context(model, context_type="Model")

# Specifically, we want to store body geometry

body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

# Let's create a new wall. The wall does not have any geometry yet.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Let's use the "3D Body" representation we created earlier to add a

# new wall-like body geometry, 5 meters long, 3 meters high, and

# 200mm thick

representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=5, height=3, thickness=0.2)

# Assign our new body geometry back to our wall

ifcopenshell.api.geometry.assign_representation(model,
product=wall, representation=representation)

# Place our wall at the origin

ifcopenshell.api.geometry.edit_object_placement(model, product=wall)

# Create a new surface style

style = ifcopenshell.api.style.add_style(model)

# Create a simple grey shading colour and transparency.

ifcopenshell.api.style.add_surface_style(model,
style=style, ifc_class="IfcSurfaceStyleShading", attributes={
"SurfaceColour": { "Name": None, "Red": 0.5, "Green": 0.5, "Blue": 0.5 },
"Transparency": 0., # 0 is opaque, 1 is transparent
})

# Now specifically our wall only will be coloured grey.

ifcopenshell.api.style.assign_representation_styles(model,
shape_representation=representation, styles=[style])
ifcopenshell.api.style.edit_presentation_style(file: ifcopenshell.file, style: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcPresentationStyle

For more information about the attributes and data types of an IfcPresentationStyle, consult the IFC documentation.

Parameters:
style (ifcopenshell.entity_instance) – The IfcPresentationStyle entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Create a new surface style

style = ifcopenshell.api.style.add_style(model)

# Change the name of the style to "Foo"

ifcopenshell.api.style.edit_presentation_style(model, style=style, attributes={"Name": "Foo"})
ifcopenshell.api.style.edit_surface_style(file: ifcopenshell.file, style: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcPresentationItem

For more information about the attributes and data types of an IfcPresentationItem, consult the IFC documentation.

The IfcPresentationItem is expected to be one of IfcSurfaceStyleShading, IfcSurfaceStyleRendering, IfcSurfaceStyleWithTextures, IfcSurfaceStyleLighting, IfcSurfaceStyleReflectance, or IfcExternallyDefinedSurfaceStyle.

To represent a colour, a nested dictionary should be used. See the example below.

Parameters:
style (ifcopenshell.entity_instance) – The IfcPresentationStyle entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Create a new surface style

style = ifcopenshell.api.style.add_style(model)

# Create a blank rendering style.

rendering = ifcopenshell.api.style.add_surface_style(model,
style=style, ifc_class="IfcSurfaceStyleRendering")

# Edit the attributes of the rendering style.

ifcopenshell.api.style.edit_surface_style(model,
style=rendering, attributes={ # A surface colour and transparency is still supplied for # viewport display only. This will supersede the shading # presentation item.
"SurfaceColour": { "Name": None, "Red": 1.0, "Green": 0.8, "Blue": 0.8 },
"Transparency": 0., # 0 is opaque, 1 is transparent

        # NOTDEFINED is assumed to be a PHYSICAL (PBR) lighting
        # model. In IFC4X3, you may choose PHYSICAL directly.
        "ReflectanceMethod": "NOTDEFINED",

        # For PBR shading, you may specify these parameters:
        "DiffuseColour": { "Name": None, "Red": 0.9, "Green": 0.8, "Blue": 0.8 },
        "SpecularColour": 0.1, # Metallic factor
        "SpecularHighlight": {"SpecularRoughness": 0.5}, # Roughness factor
    })

ifcopenshell.api.style.remove_style(file: ifcopenshell.file, style: ifcopenshell.entity_instance) → None
Removes a presentation style

All of the presentation items of the style will also be removed.

Parameters:
style (ifcopenshell.entity_instance) – The IfcPresentationStyle to remove.

Returns:
None

Return type:
None

Example:

# Create a new surface style

style = ifcopenshell.api.style.add_style(model)

# Not anymore!

ifcopenshell.api.style.remove_style(model, style=style)
ifcopenshell.api.style.remove_styled_representation(file: ifcopenshell.file, representation: ifcopenshell.entity_instance) → None
Removes a styled representation

Styled representations are typically associated with materials. This removes the representation but not the underlying styles.

Parameters:
representation (ifcopenshell.entity_instance) – The IfcStyledRepresentation to remove.

Returns:
None

Return type:
None

Example:

# Remove a styled representation

ifcopenshell.api.style.remove_styled_representation(model, representation=representation)
ifcopenshell.api.style.remove_surface_style(file: ifcopenshell.file, style: ifcopenshell.entity_instance) → None
Removes a presentation item from a presentation style

Parameters:
style (ifcopenshell.entity_instance) – The IfcPresentationItem to remove.

Returns:
None

Return type:
None

Example:

# Create a new surface style

style = ifcopenshell.api.style.add_style(model)

# Create a simple shading colour and transparency.

shading = ifcopenshell.api.style.add_surface_style(model,
style=style, ifc_class="IfcSurfaceStyleShading", attributes={
"SurfaceColour": { "Name": None, "Red": 1.0, "Green": 0.8, "Blue": 0.8 },
"Transparency": 0., # 0 is opaque, 1 is transparent
})

# Remove the shading item

ifcopenshell.api.style.remove_surface_style(model, style=shading)
ifcopenshell.api.style.unassign_material_style(file: ifcopenshell.file, material: ifcopenshell.entity_instance, style: ifcopenshell.entity_instance, context: ifcopenshell.entity_instance) → None
Unassigns a style to a material

This does the inverse of assign_material_style.

Parameters:
material (ifcopenshell.entity_instance) – The IfcMaterial which you want to unassign the style from.

style (ifcopenshell.entity_instance) – The IfcPresentationStyle (typically IfcSurfaceStyle) that you want to unassign from material. This will then be applied to all objects that have that material.

context (ifcopenshell.entity_instance) – The IfcGeometricRepresentationSubContext at which this style should be unassigned. Typically this is the Model BODY context.

Returns:
None

Return type:
None

Example:

ifcopenshell.api.style.unassign_material_style(model, material=concrete, style=style, context=body)
ifcopenshell.api.style.unassign_representation_styles(file: ifcopenshell.file, shape_representation: ifcopenshell.entity_instance, styles: list[ifcopenshell.entity_instance], should_use_presentation_style_assignment: bool = False) → None
Unassigns styles directly assigned to an object representation

This does the inverse of assign_representation_styles.

Parameters:
shape_representation (ifcopenshell.entity_instance) – The IfcShapeRepresentation of the object that you want to unassign styles from.

styles (list[ifcopenshell.entity_instance]) – A list of presentation styles, typically IfcSurfaceStyle. The number of items in the list should correlate with the number of items in the shape_representation’s Items attribute. If you have more items than styles, the last style is used.

should_use_presentation_style_assignment (bool) – This is a technical detail to accomodate a bug in Revit. This should always be left as the default of False, unless you are finding that colours aren’t showing up in Revit. In that case, set it to True, but keep in mind that this is no longer a valid IFC. Blame Autodesk.

Returns:
None

Return type:
None

Example:

ifcopenshell.api.style.unassign_representation_styles(model,
shape_representation=representation, styles=[style])

ifcopenshell.api.system
Manage distribution systems and port connectivity

Service distribution systems (mechanical, electrical, hydraulic, fire, logistical, etc) consist of connected distribution segments, fittings, terminals, control equipment, and more. This module handles port connectivity and relationships describing distribution flow.

Submodules
ifcopenshell.api.system.add_port
ifcopenshell.api.system.add_system
ifcopenshell.api.system.assign_flow_control
ifcopenshell.api.system.assign_port
ifcopenshell.api.system.assign_system
ifcopenshell.api.system.connect_port
ifcopenshell.api.system.disconnect_port
ifcopenshell.api.system.edit_system
ifcopenshell.api.system.remove_system
ifcopenshell.api.system.unassign_flow_control
ifcopenshell.api.system.unassign_port
ifcopenshell.api.system.unassign_system
Package Contents
ifcopenshell.api.system.add_port(file: ifcopenshell.file, element: ifcopenshell.entity_instance | None = None) → None
Adds a new distribution port to an element

A distribution port represents a connection point on an element, where a distribution element may be connected to another distribution element. For example, a duct segment will typically have two ports, one at either end, because you can attach another segment or fitting to either end of the duct segment.

This will both add a distribution port and automatically assign it to a distribution element.

Parameters:
element (ifcopenshell.entity_instance, optional) – The IfcDistributionElement you want to add a distribution port to.

Returns:
The newly created IfcDistributionPort

Return type:
ifcopenshell.entity_instance

Example:

# Create a duct

duct = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcDuctSegment", predefined_type="RIGIDSEGMENT")

# Create 2 ports, one for either end.

port1 = ifcopenshell.api.system.add_port(model, element=duct)
port2 = ifcopenshell.api.system.add_port(model, element=duct)
ifcopenshell.api.system.add_system(file: ifcopenshell.file, ifc_class: str = 'IfcDistributionSystem') → ifcopenshell.entity_instance
Add a new distribution system

A distribution system is a group of distribution elements, like ducts, pipes, pumps, filters, fans, and so on that distribute a medium (air, liquid, or electricity) throughout a facility. Systems may be hierarchical, with larger systems composed of smaller subsystems.

Parameters:
ifc_class (str) – The type of system, chosen from IfcDistributionSystem for mechanical, electrical, communications, plumbing, fire, or security systems. Alternatively you may choose IfcBuildingSystem for specialised building facade systems or similar. For IFC2X3, choose IfcSystem.

Returns:
The newly created IfcSystem.

Return type:
ifcopenshell.entity_instance

Example:

# A completely empty distribution system

system = ifcopenshell.api.system.add_system(model)
ifcopenshell.api.system.assign_flow_control(file: ifcopenshell.file, relating_flow_element: ifcopenshell.entity_instance, related_flow_control: ifcopenshell.entity_instance) → ifcopenshell.entity_instance | None
Assigns to the flow element control element that either sense or control some aspect of the flow element.

Note that control can be assigned only to the one flow element.

Parameters:
related_flow_control (ifcopenshell.entity_instance) – IfcDistributionControlElement which may be used to impart control on the flow element

relating_flow_element (ifcopenshell.entity_instance) – The IfcDistributionFlowElement that is being controlled / sensed

Returns:
Matching or newly created IfcRelFlowControlElements. If control is already assigned to some other element method will return None.

Return type:
ifcopenshell.entity_instance, None

Example:

flow_element = model.createIfcFlowSegment()
flow_control = model.createIfcController()
relation = ifcopenshell.api.system.assign_flow_control(
model, related_flow_control=flow_control, relating_flow_element=flow_element
)
ifcopenshell.api.system.assign_port(file: ifcopenshell.file, element: ifcopenshell.entity_instance, port: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Assigns a port to an element

If you have an orphaned port, you may assign it to a distribution element using this function. Ports should typically not be orphaned, but it may be useful when patching up models.

Parameters:
element (ifcopenshell.entity_instance) – The IfcDistributionElement to assign the port to.

port (ifcopenshell.entity_instance) – The IfcDistributionPort you want to assign.

Returns:
The IfcRelNests relationship, or the IfcRelConnectsPortToElement for IFC2X3.

Return type:
ifcopenshell.entity_instance

Example:

# Create a duct

duct = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcDuctSegment", predefined_type="RIGIDSEGMENT")

# Create 2 ports, one for either end.

port1 = ifcopenshell.api.system.add_port(model, element=duct)
port2 = ifcopenshell.api.system.add_port(model, element=duct)

# Unassign one port for some weird reason.

ifcopenshell.api.system.unassign_port(model, element=duct, port=port1)

# Reassign it back

ifcopenshell.api.system.assign_port(model, element=duct, port=port1)
ifcopenshell.api.system.assign_system(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], system: ifcopenshell.entity_instance) → None
Assigns distribution elements to a system

Note that it is not necessary to assign distribution ports to a system.

Parameters:
products (list[ifcopenshell.entity_instance]) – The list of IfcDistributionElements to assign to the system.

system (ifcopenshell.entity_instance) – The IfcSystem you want to assign the element to.

Returns:
The IfcRelAssignsToGroup relationship or None if products was empty list.

Return type:
[ifcopenshell.entity_instance, None]

Example:

# A completely empty distribution system

system = ifcopenshell.api.system.add_system(model)

# Create a duct

duct = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcDuctSegment", predefined_type="RIGIDSEGMENT")

# This duct is part of the system

ifcopenshell.api.system.assign_system(model, products=[duct], system=system)
ifcopenshell.api.system.connect_port(file: ifcopenshell.file, port1: ifcopenshell.entity_instance, port2: ifcopenshell.entity_instance, direction: str = 'NOTDEFINED', element: ifcopenshell.entity_instance | None = None) → None
Connects two ports together

A distribution element (e.g. a duct) may be connected to another distribution element (e.g. a fitting) by connecting a port at one of the duct to a port at the same end of the fitting.

Ports may only have one connection, so you cannot have multiple things connected to the same port. Nor can you have incompatible port connections, such as an electrical port connected to an airflow port.

Port connectivity may be explicit or implicit. Explicit connections are where the port connectivity is described for every single distribution element in detail. For example, a duct segment would have port connections to a duct fitting, which would have port connections to another duct segment, all the way from a fan to an air terminal exactly as constructed on site. Implicit connections only consider the key distribution control elements (e.g. the fan and the terminal) and ignore all of the details of the duct segments and fittings in between. Generally, explicit connectivity is preferred for later detailed design, and implicit connectivity is preferred for early phase design.

Parameters:
port1 (ifcopenshell.entity_instance) – The port of the first distribution element to connect.

port2 (ifcopenshell.entity_instance) – The port of the second distribution element to connect.

direction (str) – The directionality of distribution flow through the port connection. NOTDEFINED means that the direction has not yet been determined. This is useful during preliminary system design. SOURCE means that the flow is from the first element to the second element. SINK means that the flow is from the second element to the first element. SOURCEANDSINK means that flow is bi-directional between the first and second element. SOURCEANDSINK is a relatively rare scenario.

element (ifcopenshell.entity_instance, optional) – Optionally set an element through which the port connectivity is made, such as a segment or fitting. This is only to be used for implicit port connectivity where the segments and fittings are less important.

Example:

# A completely empty distribution system

system = ifcopenshell.api.system.add_system(model)

# Create a duct and a 90 degree bend fitting

duct = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcDuctSegment", predefined_type="RIGIDSEGMENT")
fitting = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcDuctFitting", predefined_type="BEND")

# The duct and fitting is part of the system

ifcopenshell.api.system.assign_system(model, products=[duct], system=system)
ifcopenshell.api.system.assign_system(model, products=[fitting], system=system)

# Create 2 ports, one for either end of both the duct and fitting.

duct_port1 = ifcopenshell.api.system.add_port(model, element=duct)
duct_port2 = ifcopenshell.api.system.add_port(model, element=duct)
fitting_port1 = ifcopenshell.api.system.add_port(model, element=fitting)
fitting_port2 = ifcopenshell.api.system.add_port(model, element=fitting)

# Connect the duct and fitting together. At this point, we have not

# yet determined the direction of the flow, so we leave direction as

# NOTDEFINED.

ifcopenshell.api.system.connect_port(model, port1=duct_port2, port2=fitting_port1)
ifcopenshell.api.system.disconnect_port(file: ifcopenshell.file, port: ifcopenshell.entity_instance) → None
Disconnects a port from any other port

A port may only be connected to one other port, so the other port is not needed to be specified.

Parameters:
port (ifcopenshell.entity_instance) – The IfcDistributionPort to disconnect.

Returns:
None

Return type:
None

Example:

# A completely empty distribution system

system = ifcopenshell.api.system.add_system(model)

# Create a duct and a 90 degree bend fitting

duct = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcDuctSegment", predefined_type="RIGIDSEGMENT")
fitting = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcDuctFitting", predefined_type="BEND")

# The duct and fitting is part of the system

ifcopenshell.api.system.assign_system(model, products=[duct], system=system)
ifcopenshell.api.system.assign_system(model, products=[fitting], system=system)

# Create 2 ports, one for either end of both the duct and fitting.

duct_port1 = ifcopenshell.api.system.add_port(model, element=duct)
duct_port2 = ifcopenshell.api.system.add_port(model, element=duct)
fitting_port1 = ifcopenshell.api.system.add_port(model, element=fitting)
fitting_port2 = ifcopenshell.api.system.add_port(model, element=fitting)

# Connect the duct and fitting together. At this point, we have not

# yet determined the direction of the flow, so we leave direction as

# NOTDEFINED.

ifcopenshell.api.system.connect_port(model, port1=duct_port2, port2=fitting_port1)

# Disconnect the port. note we could've equally disconnected

# fitting_port1 instead of duct_port2

ifcopenshell.api.system.disconnect_port(model, port=duct_port2)
ifcopenshell.api.system.edit_system(file: ifcopenshell.file, system: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcSystem

For more information about the attributes and data types of an IfcSystem, consult the IFC documentation.

Parameters:
system (ifcopenshell.entity_instance) – The IfcSystem entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# A completely empty distribution system

system = ifcopenshell.api.system.add_system(model)

# Change the name of the system to "HW" for Hot Water

ifcopenshell.api.system.edit_system(model, system=system, attributes={"Name": "HW"})
ifcopenshell.api.system.remove_system(file: ifcopenshell.file, system: ifcopenshell.entity_instance) → None
Removes a distribution system

All the distribution elements within the system are retained.

Parameters:
system (ifcopenshell.entity_instance) – The IfcSystem to remove.

Returns:
None

Return type:
None

Example:

# A completely empty distribution system

system = ifcopenshell.api.system.add_system(model)

# Delete it.

ifcopenshell.api.system.remove_system(model, system=system)
ifcopenshell.api.system.unassign_flow_control(file: ifcopenshell.file, relating_flow_element: ifcopenshell.entity_instance, related_flow_control: ifcopenshell.entity_instance) → None
Unassigns flow control element from the flow element.

Parameters:
related_flow_control (ifcopenshell.entity_instance) – IfcDistributionControlElement controling the flow element

relating_flow_element (ifcopenshell.entity_instance) – The IfcDistributionFlowElement that is being controlled

Returns:
None

Return type:
None

Example:

# assign control to the flow element

flow_element = file.createIfcFlowSegment()
flow_control = file.createIfcController()
relation = ifcopenshell.api.system.assign_flow_control(
file, relating_control=flow_control, related_object=flow_element
)

# und unassign it

ifcopenshell.api.system.unassign_flow_control(file,
relating_control=flow_control, related_object=flow_element
)
ifcopenshell.api.system.unassign_port(file: ifcopenshell.file, element: ifcopenshell.entity_instance, port: ifcopenshell.entity_instance) → None
Unassigns a port to an element

Ports are typically always assigned to a distribution element, but in some edge cases you may want to unassign the port to create an orphaned port for cleaning or patchin purposes.

Parameters:
element (ifcopenshell.entity_instance) – The IfcDistributionElement to unassign the port from.

port (ifcopenshell.entity_instance) – The IfcDistributionPort you want to unassign.

Returns:
None

Return type:
None

Example:

# Create a duct

duct = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcDuctSegment", predefined_type="RIGIDSEGMENT")

# Create 2 ports, one for either end.

port1 = ifcopenshell.api.system.add_port(model, element=duct)
port2 = ifcopenshell.api.system.add_port(model, element=duct)

# Unassign one port for some weird reason.

ifcopenshell.api.system.unassign_port(model, element=duct, port=port1)
ifcopenshell.api.system.unassign_system(file: ifcopenshell.file, products: list[ifcopenshell.entity_instance], system: ifcopenshell.entity_instance) → None
Unassigns list of products from a system

Parameters:
products (list[ifcopenshell.entity_instance]) – The list of IfcDistributionElements to unassign from the system.

system (ifcopenshell.entity_instance) – The IfcSystem you want to unassign the element from.

Returns:
None

Return type:
None

Example:

# A completely empty distribution system

system = ifcopenshell.api.system.add_system(model)

# Create a duct

duct = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcDuctSegment", predefined_type="RIGIDSEGMENT")

# This duct is part of the system

ifcopenshell.api.system.assign_system(model, products=[duct], system=system)

# Not anymore!

ifcopenshell.api.system.unassign_system(model, products=[duct], system=system)

ifcopenshell.api.type
Manage common construction types of physical elements

Almost all constructed elements may be grouped into “types”. Types include wall types, window types, column types, equipment types, and more.

Using types is critical to the success of any project.

Submodules
ifcopenshell.api.type.assign_type
ifcopenshell.api.type.map_type_representations
ifcopenshell.api.type.unassign_type
Package Contents
ifcopenshell.api.type.assign_type(file: ifcopenshell.file, related_objects: list[ifcopenshell.entity_instance], relating_type: ifcopenshell.entity_instance, should_map_representations=True) → ifcopenshell.entity_instance | None
Assigns a type to occurrences of an object

IFC supports the concept of occurrences and types. An occurrence is an actual physical product in the real world: like a wall, a chair, a door, a column, a pump, and so on.

Most occurrences have a corresponding type. A type describes either a common shape and set of properties of a particular model of equipment, or a construction typology. An occurrence may only have zero or one type.

For example, architects would typically have a door schedule for individual occurrences of doors and a door types schedule for a handful of door types, described by the door hardware, frame, and panel. Other examples might be window types or wall types. Structural engineers would have a list of column types, beam types, slab types, etc, such as a 400 diameter column, a 500 diameter column, and so on. Services consultant might nominate a particular type of sprinkler which have many occurrences, or light fixture types, and so on.

Types are critical as they communicate to the procurement team what types of equipment and products need to be procured. The individual occurrences of that type tell them how many to procure. Types are also critical in construction as they indicate succinctly how to manufacture or construct something. For example, a wall type is enough information for a builder to understand the build up and construction of a wall. Types are used to help break down cost plans, or isolate portions of an assembly process for construction scheduling. Types are also used in facility maintenance, as occurrences sharing the same type can be repaired in the same way or by replacing the same parts.

An occurrence of a type inherits all the properties and materials of the type. For example, a 2HR fire rated wall type implies that all wall occurrences of that wall type will also be 2HR fire rated.

A type may or may not have a geometric representation. If a type does not have any representation, then the occurrences are free to have any representation of their own. However, if a type has a representation, all occurrences must have the same representation. For example, if a light fixture downlight type has a representation of a cylinder, then all occurrences must have exactly the same cylinder as its representation. If you change the cylinder’s shape of the type, then all occurrence representations will also change.

If a type does not have any geometric representation, they may have a parametric material representation. This may be either a parametric layered material or parametric cross-sectional profile material. If this is the case, the occurrence must be constructed out of the parametric material. For example, if a wall type uses a list of parametric layers indicating a thickness of 13mm plasterboard and 90mm stud, then the thickness of every wall occurrence representation must be 103mm. The length of each wall, however, may vary. Similarly, if a beam type has a parametric profile material of an I-beam, then all beam occurrences must also be this I-beam shape, though the length may vary.

It is highly recommended for every occurrence to have a type. There are some exceptions to the rule, such as in heritage architecture or as-built or dilapidation models, where existing conditions are ambiguous, unknown or are so bespoke as to have no logical type.

Parameters:
related_objects (list[ifcopenshell.entity_instance]) – The IfcElement occurrences.

relating_type (ifcopenshell.entity_instance) – The IfcElementType type.

should_map_representations (bool) – If a type has a representation map, IFC requires all occurrences to map those representations. Some IFC vendors might disobey this, or you might want to handle it yourusecase. In this scenario, you may set this to False. This also enabled adding material usages mapping.

Returns:
The IfcRelDefinesByType relationship or None if related_objects was empty list.

Return type:
Union[ifcopenshell.entity_instance, None]

Example:

# A furniture type. This would correlate to a particular model in a

# manufacturer's catalogue. Like an Ikea sofa :)

furniture_type = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcFurnitureType", name="FUN01")

# An individual occurrence of a that sofa.

furniture = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")

# Assign the furniture to the furniture type. If the furniture_type

# had a representation, the furniture occurrence will also now have

# the exact same representation. This is highly efficient as you

# don't need to define the representation for every occurrence.

ifcopenshell.api.type.assign_type(model, related_objects=[furniture], relating_type=furniture_type)

# Let's imagine a parametric material layer set

wall_type = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWallType", name="WAL01")

# First, let's create a material set. This will later be assigned

# to our wall type element.

material_set = ifcopenshell.api.material.add_material_set(model,
name="GYP-ST-GYP", set_type="IfcMaterialLayerSet")

# Let's create a few materials, it's important to also give them

# categories. This makes it easy for model recipients to do things

# like "show me everything made out of aluminium / concrete / steel

# / glass / etc". The IFC specification states a list of categories

# you can use.

gypsum = ifcopenshell.api.material.add_material(model, name="PB01", category="gypsum")
steel = ifcopenshell.api.material.add_material(model, name="ST01", category="steel")

# Now let's use those materials as three layers in our set, such

# that the steel studs are sandwiched by the gypsum. Let's imagine

# we're setting the layer thickness in millimeters.

layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": .013})
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=steel)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": .092})
layer = ifcopenshell.api.material.add_layer(model, layer_set=material_set, material=gypsum)
ifcopenshell.api.material.edit_layer(model, layer=layer, attributes={"LayerThickness": .013})

# Great! Let's assign our material set to our wall type.

ifcopenshell.api.material.assign_material(model, products=[wall_type], material=material_set)

# Now, let's create a wall.

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# The wall is a WAL01 wall type.

ifcopenshell.api.type.assign_type(model, related_objects=[wall], relating_type=wall_type)

# A bit of preparation, let's create some geometric contexts since

# we want to create some geometry for our wall.

model3d = ifcopenshell.api.context.add_context(model, context_type="Model")
body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

# Notice how our thickness of 0.118 must equal .013 + .092 + .013 from our type

representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=5, height=3, thickness=0.118)

# Assign our new body geometry back to our wall

ifcopenshell.api.geometry.assign_representation(model,
product=wall, representation=representation)

# Place our wall at the origin

ifcopenshell.api.geometry.edit_object_placement(model, product=wall)
ifcopenshell.api.type.map_type_representations(file: ifcopenshell.file, related_object: ifcopenshell.entity_instance, relating_type: ifcopenshell.entity_instance) → None
Ensures that all occurrences has the same representation as the type

If a type has a representation, all occurrences must have the same representation. If the type’s representation changes, this function may be used to ensure consistency of the occurrence’s representations.

Parameters:
related_object (ifcopenshell.entity_instance) – The IfcElement occurrence.

relating_type (ifcopenshell.entity_instance) – The IfcElementType type.

Returns:
None

Return type:
None

Example:

# A furniture type. This would correlate to a particular model in a

# manufacturer's catalogue. Like an Ikea sofa :)

furniture_type = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcFurnitureType", name="FUN01")

# An individual occurrence of a that sofa.

furniture = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")

# Place our furniture at the origin

ifcopenshell.api.geometry.edit_object_placement(model, product=furniture)

# Assign the furniture to the furniture type. Right now, the

# furniture type has no representation, so the furniture may also

# have no representation, or any arbitrary representation that may

# vary from occurrence to occurrence.

ifcopenshell.api.type.assign_type(model, related_objects=[furniture], relating_type=furniture_type)

# A bit of preparation, let's create some geometric contexts since

# we want to create some geometry for our furniture type.

model3d = ifcopenshell.api.context.add_context(model, context_type="Model")
body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

# Let's create a mesh representation of an arbitrary 2m cube.

representation = ifcopenshell.api.geometry.add_sverchok_representation(model, context=body,
vertices=[[(-1.0, -1.0, 0.0), (-1.0, -1.0, 2.0), (-1.0, 1.0, 0.0), (-1.0, 1.0, 2.0),
        (1.0, -1.0, 0.0), (1.0, -1.0, 2.0), (1.0, 1.0, 0.0), (1.0, 1.0, 2.0)]],
faces=[[[0, 1, 3, 2], [2, 3, 7, 6], [6, 7, 5, 4], [4, 5, 1, 0], [2, 6, 4, 0], [7, 3, 1, 5]]])

# Assign our new body geometry back to our furniture type. In this

# case, since we use the API, all occurrences automatically get the

# representation mapped, so there is nothing more we need to do.

ifcopenshell.api.geometry.assign_representation(model,
product=furniture_type, representation=representation)

# However, if you were doing some sort of manual IFC patching, like

# assigning furniture_type.RepresentationMaps directly, then you

# might make this call:

# ifcopenshell.api.type.map_type_representations(model,

# related_object=furniture, relating_type=furniture_type)

ifcopenshell.api.type.unassign_type(file: ifcopenshell.file, related_objects: list[ifcopenshell.entity_instance]) → None
Unassigns a type from occurrences

Note that unassigning a type doesn’t automatically remove mapped representations and material usages associated with the previously assigned type.

Parameters:
related_objects (list[ifcopenshell.entity_instance]) – List of IfcElement occurrences.

Returns:
None

Return type:
None

Example:

# A furniture type. This would correlate to a particular model in a

# manufacturer's catalogue. Like an Ikea sofa :)

furniture_type = ifcopenshell.api.root.create_entity(model,
ifc_class="IfcFurnitureType", name="FUN01")

# An individual occurrence of a that sofa.

furniture = ifcopenshell.api.root.create_entity(model, ifc_class="IfcFurniture")

# Assign the furniture to the furniture type.

ifcopenshell.api.type.assign_type(model, related_objects=[furniture], relating_type=furniture_type)

# Change our mind. Maybe it's a different type?

ifcopenshell.api.type.unassign_type(model, related_objects=[furniture])

ifcopenshell.api.unit
Define units (length, area, monetary, pressure, etc)

Units can be defined as a default project unit or used specifically for certain properties. Units may be especially complex when dealing with services and equipment.

Submodules
ifcopenshell.api.unit.add_context_dependent_unit
ifcopenshell.api.unit.add_conversion_based_unit
ifcopenshell.api.unit.add_monetary_unit
ifcopenshell.api.unit.add_si_unit
ifcopenshell.api.unit.assign_unit
ifcopenshell.api.unit.edit_derived_unit
ifcopenshell.api.unit.edit_monetary_unit
ifcopenshell.api.unit.edit_named_unit
ifcopenshell.api.unit.remove_unit
ifcopenshell.api.unit.unassign_unit
Package Contents
ifcopenshell.api.unit.add_context_dependent_unit(file: ifcopenshell.file, unit_type: str = 'USERDEFINED', name: str = 'THINGAMAJIG', dimensions: tuple[int, int, int, int, int, int, int] = (0, 0, 0, 0, 0, 0, 0)) → ifcopenshell.entity_instance
Add a new arbitrary unit that can only be interpreted in a project specific context

Occasionally the construction industry uses arbitrary units to quantify objects, like “pairs” of door hardware, “palettes” or “boxes” of fixings or equipment.

Parameters:
unit_type (str) – Typically should be left as USERDEFINED, unless for some bizarre reason you are redefining something you could use a sensible normal unit for. In that case, firstly stop whatever you’re doing and have a hard think about your life, and then if life really is going that badly for you, check out the IFC docs for IfcUnitEnum.

name (str) – Give your unit a name. X what? X bananas?

dimensions (list[int]) – Units typically measure one of 7 fundamental physical dimensions: length, mass, time, electric current, temperature, substance amount, or luminous intensity. These are represented as a list of 7 integers, representing the exponents of each one of these dimensions. For example, a length unit is (1, 0, 0, 0, 0, 0, 0), where as an area unit is (2, 0, 0, 0, 0, 0, 0). A unit of meters per second is (1, 0, -1, 0, 0, 0, 0). For context dependent units, it is recommended to leave this as the default of (0, 0, 0, 0, 0, 0, 0).

Returns:
The new IfcContextDependentUnit

Return type:
ifcopenshell.entity_instance

Example:

# Boxes of things

ifcopenshell.api.unit.add_context_dependent_unit(model, name="BOXES")
ifcopenshell.api.unit.add_conversion_based_unit(file: ifcopenshell.file, name: str = 'foot', conversion_offset: float | None = None) → ifcopenshell.entity_instance
Add a conversion based unit

If you’re in one of those countries who don’t use SI units, you’re probably simply using SI units converted into another unit. If you want to use _those_ units, you can create a conversion based unit with this function. You can choose from one of: inch, foot, yard, mile, square inch, square foot, square yard, acre, square mile, cubic inch, cubic foot, cubic yard, litre, fluid ounce UK, fluid ounce US, pint UK, pint US, gallon UK, gallon US, degree, ounce, pound, ton UK, ton US, lbf, kip, psi, ksi, minute, hour, day, btu, and fahrenheit.

Parameters:
name (str) – A converted name chosen from the list above.

conversion_offset (float, optional) – If you want to offset the conversion further by a set number, you may specify it here. For example, fahrenheit is 1.8 \* kelvin - 459.67. The -459.67 is the conversion offset. Note that this is just an example and you don’t actually need to specify that for fahrenheit as it’s built into this API function. For advanced users only.

Returns:
The new IfcConversionBasedUnit or IfcConversionBasedUnitWithOffset

Return type:
ifcopenshell.entity_instance

Example:

# Some common imperial measurements

length = ifcopenshell.api.unit.add_conversion_based_unit(model, name="inch")
area = ifcopenshell.api.unit.add_conversion_based_unit(model, name="square foot")

# Make it our default units, if we are doing an imperial building

ifcopenshell.api.unit.assign_unit(model, units=[length, area])
ifcopenshell.api.unit.add_monetary_unit(file: ifcopenshell.file, currency: str = 'DOLLARYDOO') → ifcopenshell.entity_instance
Add a new currency

Currency units are useful in cost plans to know in what currency the costs are calculated in. The currencies should follow ISO 4217, like USD, GBP, AUD, MYR, etc.

Parameters:
currency (str) – The currency code

Returns:
The newly created IfcMonetaryUnit

Return type:
ifcopenshell.entity_instance

Example:

# If you do all your cost plans in Zimbabwean dollars then nobody

# knows how accurate the numbers are.

zwl = ifcopenshell.api.unit.add_monetary_unit(model, currency="ZWL")

# Make it our default currency

ifcopenshell.api.unit.assign_unit(model, units=[zwl])
ifcopenshell.api.unit.add_si_unit(file: ifcopenshell.file, unit_type: str = 'LENGTHUNIT', prefix: str | None = None) → ifcopenshell.entity_instance
Add a new SI unit

The supported types are ABSORBEDDOSEUNIT, AMOUNTOFSUBSTANCEUNIT, AREAUNIT, DOSEEQUIVALENTUNIT, ELECTRICCAPACITANCEUNIT, ELECTRICCHARGEUNIT, ELECTRICCONDUCTANCEUNIT, ELECTRICCURRENTUNIT, ELECTRICRESISTANCEUNIT, ELECTRICVOLTAGEUNIT, ENERGYUNIT, FORCEUNIT, FREQUENCYUNIT, ILLUMINANCEUNIT, INDUCTANCEUNIT, LENGTHUNIT, LUMINOUSFLUXUNIT, LUMINOUSINTENSITYUNIT, MAGNETICFLUXDENSITYUNIT, MAGNETICFLUXUNIT, MASSUNIT, PLANEANGLEUNIT, POWERUNIT, PRESSUREUNIT, RADIOACTIVITYUNIT, SOLIDANGLEUNIT, THERMODYNAMICTEMPERATUREUNIT, TIMEUNIT, VOLUMEUNIT.

Prefixes supported are ATTO, CENTI, DECA, DECI, EXA, FEMTO, GIGA, HECTO, KILO, MEGA, MICRO, MILLI, NANO, PETA, PICO, TERA.

Parameters:
unit_type (str) – A type of unit chosen from the list above. For example, choosing LENGTHUNIT will give you a metre.

prefix (str,optional) – A prefix chosen from the list above, or None for no prefix.

Returns:
The newly created IfcSIUnit

Return type:
ifcopenshell.entity_instance

Example:

# Millimeters and square meters

length = ifcopenshell.api.unit.add_si_unit(model, unit_type="LENGTHUNIT", prefix="MILLI")
area = ifcopenshell.api.unit.add_si_unit(model, unit_type="AREAUNIT")

# Make it our default units, if we are doing a metric building

ifcopenshell.api.unit.assign_unit(model, units=[length, area])
ifcopenshell.api.unit.assign_unit(file: ifcopenshell.file, units: list[ifcopenshell.entity_instance] | None = None, length: dict | None = None, area: dict | None = None, volume: dict | None = None) → ifcopenshell.entity_instance
Assign default project units

Whenever a unitised quantity is specified, such as a length, area, voltage, pressure, etc, these project units are used by default.

It is also possible to override units for specific properties. For example, generally you might want square metres for area measurements, but you might want square millimeters for the measurements of the cross sectional area of cables in cable trays. However, this function only deals with the default project units.

Parameters:
units (list[ifcopenshell.entity_instance],optional) – A list of units to assign as project defaults. See ifcopenshell.api.unit.add_si_unit, unit.add_conversion_based_unit, and unit.add_monetary_unit for information on how to create units.

Returns:
The IfcUnitAssignment element

Return type:
ifcopenshell.entity_instance

Example:

# You need a project before you can assign units.

ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")

# Millimeters and square meters

length = ifcopenshell.api.unit.add_si_unit(model, unit_type="LENGTHUNIT", prefix="MILLI")
area = ifcopenshell.api.unit.add_si_unit(model, unit_type="AREAUNIT")

# Make it our default units, if we are doing a metric building

ifcopenshell.api.unit.assign_unit(model, units=[length, area])

# Alternatively, you may specify without any arguments to

# automatically create millimeters, square meters, and cubic meters

# as a convenience for testing purposes. Sorry imperial folks, we

# prioritise metric here.

ifcopenshell.api.unit.assign_unit(model)
ifcopenshell.api.unit.edit_derived_unit(file: ifcopenshell.file, unit: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcDerivedUnit

For more information about the attributes and data types of an IfcDerivedUnit, consult the IFC documentation.

Parameters:
unit (ifcopenshell.entity_instance) – The IfcDerivedUnit entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

ifcopenshell.api.unit.edit_monetary_unit(file: ifcopenshell.file, unit: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcMonetaryUnit

For more information about the attributes and data types of an IfcMonetaryUnit, consult the IFC documentation.

Parameters:
unit (ifcopenshell.entity_instance) – The IfcMonetaryUnit entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# If you do all your cost plans in Zimbabwean dollars then nobody

# knows how accurate the numbers are.

zwl = ifcopenshell.api.unit.add_monetary_unit(model, currency="ZWL")

# Ah who are we kidding

ifcopenshell.api.unit.edit_monetary_unit(model, unit=zwl, attributes={"Currency": "USD"})
ifcopenshell.api.unit.edit_named_unit(file: ifcopenshell.file, unit: ifcopenshell.entity_instance, attributes: dict[str, Any]) → None
Edits the attributes of an IfcNamedUnit

Named units include SI units, conversion based units (imperial units), and context dependent units.

For more information about the attributes and data types of an IfcNamedUnit, consult the IFC documentation.

Parameters:
unit (ifcopenshell.entity_instance) – The IfcNamedUnit entity you want to edit

attributes (dict) – a dictionary of attribute names and values.

Returns:
None

Return type:
None

Example:

# Boxes of things

unit = ifcopenshell.api.unit.add_context_dependent_unit(model, name="BOXES")

# Uh, crates? Boxes? Whatever.

ifcopenshell.api.unit.edit_named_unit(model, unit=unit, attibutes={"Name": "CRATES"})
ifcopenshell.api.unit.remove_unit(file: ifcopenshell.file, unit: ifcopenshell.entity_instance) → None
Remove a unit

Be very careful when a unit is removed, as it may mean that previously defined quantities in the model completely lose their meaning.

Parameters:
unit (ifcopenshell.entity_instance) – The unit element to remove

Returns:
None

Return type:
None

Example:

# What?

unit = ifcopenshell.api.unit.add_context_dependent_unit(model, name="HANDFULS")

# Yeah maybe not.

ifcopenshell.api.unit.remove_unit(model, unit=unit)
ifcopenshell.api.unit.unassign_unit(file: ifcopenshell.file, units: list[ifcopenshell.entity_instance] | None = None) → None
Unassigns units as default units for the project

Parameters:
units (list[ifcopenshell.entity_instance],optional) – A list of units to assign as project defaults.

Returns:
None

Return type:
None

Example:

# You need a project before you can assign units.

ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject")

# Millimeters and square meters

length = ifcopenshell.api.unit.add_si_unit(model, unit_type="LENGTHUNIT", prefix="MILLI")
area = ifcopenshell.api.unit.add_si_unit(model, unit_type="AREAUNIT")

# Make it our default units, if we are doing a metric building

ifcopenshell.api.unit.assign_unit(model, units=[length, area])

# Actually, we don't need areas.

ifcopenshell.api.unit.unassign_unit(model, units=[area])

ifcopenshell.api.void
Create void relationships between openings and physical elements

An opening is a special element (created using ifcopenshell.api.root.create_entity()) that may then be used to create voids in other elements (such as walls and slabs). These voids may then be filled with doors, trapdoors, skylights, and so on.

Submodules
ifcopenshell.api.void.add_filling
ifcopenshell.api.void.add_opening
ifcopenshell.api.void.remove_filling
ifcopenshell.api.void.remove_opening
Package Contents
ifcopenshell.api.void.add_filling(file: ifcopenshell.file, opening: ifcopenshell.entity_instance, element: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Fill an opening with an element

Physical elements may have openings in them. For example, a wall might have an opening for a door. That opening is then filled by the door. This indicates that when the door moves, the opening will move with it. Or if the door is removed, then the opening may remain and need to be filled.

Parameters:
opening (ifcopenshell.entity_instance) – The IfcOpeningElement to fill with the element.

element (ifcopenshell.entity_instance) – The IfcElement to be inserted into the opening.

Returns:
The new IfcRelFillsElement relationship

Return type:
ifcopenshell.entity_instance

Example:

# A bit of preparation, let's create some geometric contexts since

# we want to create some geometry for our wall and opening.

model3d = ifcopenshell.api.context.add_context(model, context_type="Model")
body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

# Create a wall

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Let's use the "3D Body" representation we created earlier to add a

# new wall-like body geometry, 5 meters long, 3 meters high, and

# 200mm thick

representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=5, height=3, thickness=0.2)
ifcopenshell.api.geometry.assign_representation(model,
product=wall, representation=representation)

# Place our wall at the origin

ifcopenshell.api.geometry.edit_object_placement(model, product=wall)

# Create an opening, such as for a service penetration with fire and

# acoustic requirements.

opening = ifcopenshell.api.root.create_entity(model, ifc_class="IfcOpeningElement")

# Let's create an opening representation of a 950mm x 2100mm door.

# Notice how the thickness is greater than the wall thickness, this

# helps resolve floating point resolution errors in 3D.

representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=.95, height=2.1, thickness=0.4)
ifcopenshell.api.geometry.assign_representation(model,
product=opening, representation=representation)

# Let's shift our door 1 meter along the wall and 100mm along the

# wall, to create a nice overlap for the opening boolean.

matrix = np.identity(4)
matrix[:,3] = [1, -.1, 0, 0]
ifcopenshell.api.geometry.edit_object_placement(model, product=opening, matrix=matrix)

# The opening will now void the wall.

ifcopenshell.api.void.add_opening(model, opening=opening, element=wall)

# Create a door

door = ifcopenshell.api.root.create_entity(model, ifc_class="IfcDoor")

# Let's create a door representation of a 950mm x 2100mm door.

representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=.95, height=2.1, thickness=0.05)
ifcopenshell.api.geometry.assign_representation(model,
product=door, representation=representation)

# Let's shift our door 1 meter along the wall and 100mm along the

# wall, which lines up with our opening.

matrix = np.identity(4)
matrix[:,3] = [1, .05, 0, 0]
ifcopenshell.api.geometry.edit_object_placement(model, product=door, matrix=matrix)

# The door will now fill the opening.

ifcopenshell.api.void.add_filling(model, opening=opening, element=door)
ifcopenshell.api.void.add_opening(file: ifcopenshell.file, opening: ifcopenshell.entity_instance, element: ifcopenshell.entity_instance) → ifcopenshell.entity_instance
Create an opening in an element

It is often necessary to cut out openings in elements like walls and slabs to make space to insert doors, windows, and other services that go through these penetrations.

Whereas it is possible to simply draw the wall as a rectangle with a hole in it for the opening, often these openings have specific meanings. For example, an opening might be filled with a window, and so when the window moves, the opening should move with it. Alternatively, the opening itself might have fire or acoustic requirements, such that any service or equipment passing through that space must also comply with those requirements. For these types of semantic openings, you should have a distinct opening element which voids your regular element. For example, your wall will still be a rectangular prism with no hole in it, and a separate opening element will have a box representing the extents of the opening for a window. The opening element will automatically perform a geometric boolean operation to cut out the wall’s geometry.

Whenever you have an opening in you project, you should determine whether or not the opening is semantic (i.e. should be represented by a distinct opening object) or non-semantic (i.e. should simply be booleaned or be part of the shape of the object).

Parameters:
opening (ifcopenshell.entity_instance) – The IfcOpeningElement to cut out the element.

element (ifcopenshell.entity_instance) – The IfcElement to insert the opening into.

Returns:
The new IfcRelVoidsElement relationship

Return type:
ifcopenshell.entity_instance

Example:

# A bit of preparation, let's create some geometric contexts since

# we want to create some geometry for our wall and opening.

model3d = ifcopenshell.api.context.add_context(model, context_type="Model")
body = ifcopenshell.api.context.add_context(model,
context_type="Model", context_identifier="Body", target_view="MODEL_VIEW", parent=model3d)

# Create a wall

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Let's use the "3D Body" representation we created earlier to add a

# new wall-like body geometry, 5 meters long, 3 meters high, and

# 200mm thick

representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=5, height=3, thickness=0.2)
ifcopenshell.api.geometry.assign_representation(model,
product=wall, representation=representation)

# Place our wall at the origin

ifcopenshell.api.geometry.edit_object_placement(model, product=wall)

# Create an opening, such as for a service penetration with fire and

# acoustic requirements.

opening = ifcopenshell.api.root.create_entity(model, ifc_class="IfcOpeningElement")

# Let's create an opening representation of a 950mm x 2100mm door.

# Notice how the thickness is greater than the wall thickness, this

# helps resolve floating point resolution errors in 3D.

representation = ifcopenshell.api.geometry.add_wall_representation(model,
context=body, length=.95, height=2.1, thickness=0.4)
ifcopenshell.api.geometry.assign_representation(model,
product=opening, representation=representation)

# Let's shift our door 1 meter along the wall and 100mm along the

# wall, to create a nice overlap for the opening boolean.

matrix = np.identity(4)
matrix[:,3] = [1, -.1, 0, 0]
ifcopenshell.api.geometry.edit_object_placement(model, product=opening, matrix=matrix)

# The opening will now void the wall.

ifcopenshell.api.void.add_opening(model, opening=opening, element=wall)
ifcopenshell.api.void.remove_filling(file: ifcopenshell.file, element: ifcopenshell.entity_instance) → None
Remove a filling relationship

If an element is filling an opening, this removes the relationship such that the opening and element both still exist, but the element no longer fills the opening.

Parameters:
element (ifcopenshell.entity_instance) – The element filling an opening.

Returns:
None

Return type:
None

Example:

# Create a wall

wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")

# Create an opening, such as for a service penetration with fire and

# acoustic requirements.

opening = ifcopenshell.api.root.create_entity(model, ifc_class="IfcOpeningElement")

# Create a door

door = ifcopenshell.api.root.create_entity(model, ifc_class="IfcDoor")

# The door will now fill the opening.

ifcopenshell.api.void.add_filling(model, opening=opening, element=door)

# Not anymore!

ifcopenshell.api.void.remove_filling(model, element=door)
ifcopenshell.api.void.remove_opening(file: ifcopenshell.file, opening: ifcopenshell.entity_instance) → None
Remove an opening

Fillings are retained as orphans. Voided elements remain. Openings cannot exist by themselves, so not only is the opening relationship removed, the opening is also removed.

Parameters:
opening (ifcopenshell.entity_instance) – The IfcOpeningElement to remove.

Returns:
None

Return type:
None

Example:

# Create an oprhaned opening. Note that an orphaned opening is

# invalid, as an opening can only exist when voiding another

# element.

opening = ifcopenshell.api.root.create_entity(model, ifc_class="IfcOpeningElement")

# Remove it. This brings us back to a valid model.

ifcopenshell.api.void.remove_opening(model, opening=opening)

ifcopenshell.geom
Geometry processing and analysis

IFC may define geometry explicitly (such as meshes) or implicitly (such as parametric extrusions). This module provides methods to extract geometric definitions in IFC into explicitly tessellated triangles or OpenCASCADE Breps for further processing.

This is typically needed when writing software to visualise or analyse geometry. See also ifcopenshell.util.shape for deriving quantities.

Submodules
ifcopenshell.geom.app
ifcopenshell.geom.code_editor_pane
ifcopenshell.geom.main
ifcopenshell.geom.occ_utils
Package Contents
class ifcopenshell.geom.entity_instance(e, file=None)
Represents an entity (wall, slab, property, etc) of an IFC model

An IFC model consists of entities. Examples of entities include walls, slabs, doors and so on. Entities can also be non-physical things, like properties, systems, construction tasks, colours, geometry, and more.

Entities are defined through an IFC Class. There are hundreds of IFC Classes defined as part of the ISO standard by the buildingSMART International organisation. The IFC Class defines the attributes of an entity, as well as the data types and whether or not an attribute is mandatory or optional.

IfcOpenShell’s API dynamically implements the IFC schema. You will not find documentation about available IFC Classes, or what attributes they have. Please consult the buildingSMART official documentation or start reading Introduction to IFC.

In addition to the Python methods you see documented here, an instantiated entity_instance will have attributes defined by its IFC class. For example, an entity instance which is an IfcWall class will have a Name attribute, and an IfcColourRgb will have a Red attribute. Please consult the buildingSMART official documentation.

Example:

model = ifcopenshell.open(file_path)
walls = model.by_type("IfcWall")
wall = walls[0]

print(wall) # #38=IFCWALL('2MEinnTPbCMwLOgceaQZFu',$,$,'My Wall',$,#52,#47,$,$);
print(wall.is_a()) # IfcWall

# Note: the `Name` attribute is dynamic, based on the IFC class.

print(wall.Name) # My Wall

# Attributes are ordered and may also be accessed via index.

print(wall[3]) # My Wall

print(wall.**class**) # <class 'ifcopenshell.entity_instance'>
attribute_name(attr_idx: int) → str
Return the name of a positional attribute of the element

Parameters:
attr_idx (int) – The index of the attribute

Return type:
string

attribute_type(attr: int | str) → str
Return the data type of a positional attribute of the element

Parameters:
attr (Union[int, str]) – The index or name of the attribute

Return type:
string

compare(other, op, reverse=False)
Compares with another instance.

For simple types the declaration name is not taken into account:

f = ifcopenshell.file()
f.createIfcInteger(0) < f.createIfcPositiveInteger(1)
True
For entity types the declaration name is taken into account:

f.createIfcWall('a') < f.createIfcWall('b')
True
f.createIfcWallStandardCase('a') < f.createIfcWall('b')
False
Comparing simple types with different underlying types throws an exception:

f.createIfcInteger(0) < f.createIfcLabel('x')
Traceback (most recent call last):
File "<stdin>", line 1, in <module>
File "entity*instance.py", line 371, in compare
return op(a, b)
TypeError: '<' not supported between instances of 'int' and 'str'
Args:
other (\_type*): Right hand side (or lhs when reverse = True) op (_type_): The comparison operator (likely from the operator module) reverse (bool, optional): When true swaps lhs and rhs. Defaults to False.

Returns:
bool: The comparison predicate applied to self and other

get_info(include_identifier=True, recursive=False, return_type=dict, ignore=(), scalar_only=False) → dict
Return a dictionary of the entity_instance’s properties (Python and IFC) and their values.

Parameters:
include_identifier (bool) – Whether or not to include the STEP numerical identifier

recursive (bool) – Whether or not to convert referenced IFC elements into dictionaries too. All attributes also apply recursively

return_type (dict|list|other) – The return data type to be casted into

ignore (set|list) – A list of attribute names to ignore

scalar_only (bool) – Filters out all values that are IFC instances

Returns:
A dictionary of properties and their corresponding values

Return type:
dict

Example:

ifc_file = ifcopenshell.open(file_path)
products = ifc_file.by_type("IfcProduct")
obj_info = products[0].get_info()
print(obj_info.keys())

> > > dict_keys(['Description', 'Name', 'BuildingAddress', 'LongName', 'GlobalId', 'ObjectPlacement', 'OwnerHistory', 'ObjectType',
> > >
> > > > > > ...'ElevationOfTerrain', 'CompositionType', 'id', 'Representation', 'type', 'ElevationOfRefHeight'])
> > > > > > get_info_2(include_identifier=True, recursive=False, return_type=dict, ignore=())
> > > > > > More perfomant version of .get_info() but with limited arguments values.

Method has exactly the same signature as .get_info() but it doesn’t support getting information non-recursively.

Currently supported arguments values:
include_identifier: True

recursive: True (will fail with default False value from .get_info())

return_type: dict

ignore: () (empty tuple)

id() → int
Return the STEP numerical identifier

Return type:
int

is_a() → str
is_a(ifc_class: str) → bool
is_a(with_schema: bool) → str
Return the IFC class name of an instance, or checks if an instance belongs to a class.

The check will also return true if a parent class name is provided.

Parameters:
args (Union[str, bool]) – If specified, is a case insensitive IFC class name to check or if specified as a boolean then will define whether returned IFC class name should include schema name (e.g. “IFC4.IfcWall” if True and “IfcWall” if False). If omitted will act as False.

Returns:
Either the name of the class, or a boolean if it passes the check

Return type:
Union[str, bool]

Example:

f = ifcopenshell.file()
f.create_entity('IfcPerson')
f.is_a()

> > > 'IfcPerson'
> > > f.is_a('IfcPerson')
> > > True
> > > is_entity() → bool
> > > Tests whether the instance is an entity type as opposed to a simple data type.

Returns:
bool: True if the instance is an entity

to_string(valid_spf=True) → str
Returns a string representation of the current entity instance. Equal to str(self) when valid_spf=False. When valid_spf is True returns a representation of the string that conforms to valid Step Physical File notation. The difference being entity names in upper case and string attribute values with unicode values encoded per the specific control directives.

static unwrap_value(v)
static walk(f: Callable[[Any], bool], g: Callable[[Any], Any], value: Any) → Any
Applies a transformation to value based on a given condition.

If value is a nested structure (e.g., a list or a tuple) will apply transformation to it’s elements.

Parameters:
f (Callable) – A callable that takes a single argument and returns a boolean value. It represents the condition.

g (Callable) – A callable that takes a single argument and returns a transformed value. It represents the transformation.

value (Any) – Any object, the input value to be processed

Returns:
Transformed value

Return type:
Any

Example:

# Define condition and transformation functions

condition = lambda v: v == old
transform = lambda v: new

# Usage example

attribute_value = element.RelatedElements
print(old in attribute_value, new in attribute_value) # True, False

result = element.walk(condition, transform, element.RelatedElements)
print(old in attribute_value, new in attribute_value) # False, True
static wrap_value(v, file)
property file
wrapped_data: ifcopenshell.ifcopenshell_wrapper.entity_instance
class ifcopenshell.geom.file(f: ifcopenshell.ifcopenshell_wrapper.file | None = None, schema: str | None = None, schema_version: tuple[int, int, int, int] | None = None)
Base class for containing IFC files.

Class has instance methods for filtering by element Id, Type, etc. Instantiated objects can be subscripted by Id or Guid

Example:

model = ifcopenshell.open(file_path)
products = model.by_type("IfcProduct")
print(products[0].id(), products[0].GlobalId) # 122 2XQ$n5SLP5MBLyL442paFx
print(products[0] == model[122] == model["2XQ$n5SLP5MBLyL442paFx"]) # True
Create a new blank IFC model

This IFC model does not have any entities in it yet. See the create_entity function for how to create new entities. All data is stored in memory. If you wish to write the IFC model to disk, see the write function.

Parameters:
f – The underlying IfcOpenShell file object to be wrapped. This is an internal implementation detail and should generally be left as None by users.

schema (string) – Which IFC schema to use, chosen from “IFC2X3”, “IFC4”, or “IFC4X3”. These refer to the ISO approved versions of IFC. Defaults to “IFC4” if not specified, which is currently recommended for all new projects.

schema_version (tuple[int, int, int, int]) – If you want to specify an exact version of IFC that may not be an ISO approved version, use this argument instead of schema. IFC versions on technical.buildingsmart.org are described using 4 integers representing the major, minor, addendum, and corrigendum number. For example, (4, 0, 2, 1) refers to IFC4 ADD2 TC1, which is the official version approved by ISO when people refer to “IFC4”. Generally you should not use this argument unless you are testing non-ISO IFC releases.

Example:

# Create a new IFC4 model, create a wall, then save it to an IFC-SPF file.

model = ifcopenshell.file()
model.create_entity("IfcWall")
model.write("/path/to/model.ifc")

# Create a new IFC4X3 model

model = ifcopenshell.file(schema="IFC4X3")

# A poweruser testing out a particular version of IFC4X3

model = ifcopenshell.file(schema_version=(4, 3, 0, 1))
add(inst: ifcopenshell.entity_instance, \_id: int = None) → ifcopenshell.entity_instance
Adds an entity including any dependent entities to an IFC file. If the entity already exists, it is not re-added. Existence of entity is checked by it’s .identity().

Parameters:
inst (ifcopenshell.entity_instance) – The entity instance to add

Returns:
An ifcopenshell.entity_instance

Return type:
ifcopenshell.entity_instance

batch()
Low-level mechanism to speed up deletion of large subgraphs

begin_transaction() → None
by_guid(guid: str) → ifcopenshell.entity_instance
Return an IFC entity instance filtered by IFC GUID.

Parameters:
guid (string) – GlobalId value in 22-character encoded form

Raises:
RuntimeError – If guid is not found.

Returns:
An ifcopenshell.entity_instance

Return type:
ifcopenshell.entity_instance

by_id(id: int) → ifcopenshell.entity_instance
Return an IFC entity instance filtered by IFC ID.

Parameters:
id (int) – STEP numerical identifier

Raises:
RuntimeError – If id is not found.

Returns:
An ifcopenshell.entity_instance

Return type:
ifcopenshell.entity_instance

by_type(type: str, include_subtypes=True) → list[ifcopenshell.entity_instance]
Return IFC objects filtered by IFC Type and wrapped with the entity_instance class.

If an IFC type class has subclasses, all entities of those subclasses are also returned.

Parameters:
type (string) – The case insensitive type of IFC class to return.

include_subtypes (bool) – Whether or not to return subtypes of the IFC class

Raises:
RuntimeError – If type is not found in IFC schema.

Returns:
A list of ifcopenshell.entity_instance objects

Return type:
list[ifcopenshell.entity_instance]

create_entity(type: str, \*args, \*\*kwargs) → ifcopenshell.entity_instance
Create a new IFC entity in the file.

You can also use dynamic methods similar to ifc_file.createIfcWall(…) to create IFC entities. They work exactly the same as if you would do ifc_file.create_entity(“IfcWall”, …) but the resulting typing is not as accurate as for create_entity due to a dynamic nature of those methods.

Parameters:
type (string) – Case insensitive name of the IFC class

args – The positional arguments of the IFC class

kwargs – The keyword arguments of the IFC class

Returns:
An entity instance

Return type:
ifcopenshell.entity_instance

Example:

f = ifcopenshell.file()
f.create_entity("IfcPerson")

# >>> #1=IfcPerson($,$,$,$,$,$,$,$)

f.create_entity("IfcPerson", "Foobar")

# >>> #2=IfcPerson('Foobar',$,$,$,$,$,$,$)

f.create_entity("IfcPerson", Identification="Foobar")

# >>> #3=IfcPerson('Foobar',$,$,$,$,$,$,$)

discard_transaction() → None
end_transaction() → None
static from_pointer(v) → file
static from_string(s: str) → file
get_inverse(inst: ifcopenshell.entity_instance, allow_duplicate: bool = False, with_attribute_indices: bool = False) → list[ifcopenshell.entity_instance]
Return a list of entities that reference this entity

Warning: this is a slow function, especially when there is a large number of inverses (such as for a shared owner history). If you are only interested in the total number of inverses (typically 0, 1, or N), consider using get_total_inverses().

Parameters:
inst (ifcopenshell.entity_instance) – The entity instance to get inverse relationships

allow_duplicate – Returns a list when True, set when False

with_attribute_indices – Returns pairs of <i, idx> where i[idx] is inst or contains inst. Requires allow_duplicate=True

Returns:
A list of ifcopenshell.entity_instance objects

Return type:
list[ifcopenshell.entity_instance]

get_total_inverses(inst: ifcopenshell.entity_instance) → int
Returns the number of entities that reference this entity

This is equivalent to len(model.get_inverse(element)), but significantly faster.

Parameters:
inst (ifcopenshell.entity_instance) – The entity instance to get inverse relationships

Returns:
The total number of references

Return type:
int

redo() → None
remove(inst: ifcopenshell.entity_instance) → None
Deletes an IFC object in the file.

Attribute values in other entity instances that reference the deleted object will be set to null. In the case of a list or set of references, the reference to the deleted will be removed from the aggregate.

Parameters:
inst (ifcopenshell.entity_instance) – The entity instance to delete

Return type:
None

set_history_size(size: int) → None
traverse(inst: ifcopenshell.entity_instance, max_levels=None, breadth_first=False) → list[ifcopenshell.entity_instance]
Get a list of all referenced instances for a particular instance including itself

Parameters:
inst (ifcopenshell.entity_instance) – The entity instance to get all sub instances

max_levels (bool) – How far deep to recursively fetch sub instances. None or -1 means infinite.

breadth_first – Whether to use breadth-first search, the default is depth-first.

Returns:
A list of ifcopenshell.entity_instance objects

Return type:
list[ifcopenshell.entity_instance]

unbatch()
Low-level mechanism to speed up deletion of large subgraphs

undo() → None
write(path: os.PathLike | str, format: str | None = None, zipped: bool = False) → None
Write ifc model to file.

:param format: Force use of a specific format. Guessed from file name
if None. Supported formats : .ifc, .ifcXML, .ifcZIP (equivalent to format=”.ifc” with zipped=True) For zipped .ifcXML use format=”.ifcXML” with zipped=True

:param zipped: zip the file after it is written :type zipped: bool

Example:

model.write("path/to/model.ifc")
model.write("path/to/model.ifcXML")
model.write("path/to/model.ifcZIP")
model.write("path/to/model.ifcZIP", format=".ifcXML", zipped=True)
model.write("path/to/model.anyextension", format=".ifcXML")
future = []
history = []
history_size = 64
property schema: Literal['IFC2X3', 'IFC4', 'IFC4X3']
General IFC schema version: IFC2X3, IFC4, IFC4X3.

property schema_identifier: str
Full IFC schema version: IFC2X3_TC1, IFC4_ADD2, IFC4X3_ADD2, etc.

property schema_version: tuple[int, int, int, int]
Numeric representation of the full IFC schema version.

E.g. IFC4X3_ADD2 is represented as (4, 3, 2, 0).

transaction: Transaction | None = None
wrapped_data: ifcopenshell.ifcopenshell_wrapper.file
class ifcopenshell.geom.iterator(settings: iterator.**init**.settings, file_or_filename: ifcopenshell.file.file | str, num_threads: int = 1, include: list[ifcopenshell.entity_instance.entity_instance] | list[str] | None = None, exclude: list[ifcopenshell.entity_instance.entity_instance] | list[str] | None = None, geometry_library: GEOMETRY_LIBRARY = 'opencascade')
Bases: ifcopenshell.ifcopenshell_wrapper.Iterator

get()
settings
class ifcopenshell.geom.missing_setting
class ifcopenshell.geom.serializer_settings(\*\*kwargs)
Bases: settings_mixin, ifcopenshell.ifcopenshell_wrapper.SerializerSettings

Pythonic interface mixin to the settings modules and to provide an additional setting to enable pythonOCC when available

class ifcopenshell.geom.serializers
static obj(out_filename: str | serializers, mtl_filename: str | serializers, geometry_settings: serializers.obj.settings, settings: serializer_settings) → ifcopenshell.ifcopenshell_wrapper.WaveFrontOBJSerializer
static svg(out_filename: str | serializers, geometry_settings: serializers.svg.settings, settings: serializer_settings) → ifcopenshell.ifcopenshell_wrapper.SvgSerializer
buffer
gltf
hdf5
xml
class ifcopenshell.geom.settings(\*\*kwargs)
Bases: settings_mixin, ifcopenshell.ifcopenshell_wrapper.Settings

Pythonic interface mixin to the settings modules and to provide an additional setting to enable pythonOCC when available

use_python_opencascade = False
class ifcopenshell.geom.settings_mixin(\*\*kwargs)
Pythonic interface mixin to the settings modules and to provide an additional setting to enable pythonOCC when available

get(k: SETTING) → Any
get(k: SERIALIZER_SETTING) → Any
Return value of the setting named k.

Raises:
RuntimeError – If there is no setting with name k.

static name(k: str) → SETTING | SERIALIZER_SETTING
static rname(k: SETTING | SERIALIZER_SETTING) → str
set(k: SETTING, v: Any) → None
set(k: SERIALIZER_SETTING, v: Any) → None
Set value of the setting named k to v.

Raises:
RuntimeError – If there is no setting with name k.

setting_names() → tuple[SETTING, Ellipsis]
setting_names() → tuple[SERIALIZER_SETTING, Ellipsis]
class ifcopenshell.geom.tree(file: tree.**init**.file | None = None, settings: tree.**init**.settings | None = None)
Bases: ifcopenshell.ifcopenshell_wrapper.tree

add_file(file: tree.add_file.file, settings: tree.add_file.settings) → None
add_iterator(iterator: tree.add_iterator.iterator) → None
clash_clearance_many(set_a, set_b, clearance=0.05, check_all=False)
clash_collision_many(set_a, set_b, allow_touching=False)
clash_intersection_many(set_a, set_b, tolerance=0.002, check_all=True)
select(value: ifcopenshell.entity_instance.entity_instance | ifcopenshell.ifcopenshell_wrapper.BRepElement | tuple[float, float, float] | OCC.Core.TopoDS.TopoDS_Shape, **kwargs) → list[ifcopenshell.entity_instance.entity_instance]
select_box(value, **kwargs) → list[ifcopenshell.entity_instance.entity_instance]
args
ifcopenshell.geom.consume_iterator(it: iterator, with_progress: Literal[False] = False) → Generator[IteratorOutput, None, None]
ifcopenshell.geom.consume_iterator(it: iterator, with_progress: Literal[True]) → Generator[tuple[int, IteratorOutput], None, None]
ifcopenshell.geom.consume_iterator(it: iterator, with_progress: bool) → Generator[IteratorOutput | tuple[int, IteratorOutput], None, None]
ifcopenshell.geom.create_shape(settings: create_shape.settings, inst: ifcopenshell.entity_instance.entity_instance, repr: ifcopenshell.entity_instance.entity_instance | None = None, geometry_library: GEOMETRY_LIBRARY = 'opencascade') → ShapeType | ShapeElementType | ifcopenshell.ifcopenshell_wrapper.Transformation | ifcopenshell.geom.occ_utils.shape_tuple | OCC.Core.TopoDS.TopoDS_Shape
Return a geometric representation from STEP-based IFCREPRESENTATIONSHAPE or Return an OpenCASCADE BRep if settings.USE_PYTHON_OPENCASCADE == True

Note that in Python, you must store a reference to the element returned by this function to prevent garbage collection when you access its children. See #1124.

Raises:
RuntimeError – If failed to process shape. You can turn detailed logging to get more details.

Returns:
inst is IfcProduct and repr provided / None -> ShapeElementType

inst is IfcRepresentation and repr is None -> ShapeType

inst is IfcRepresentationItem and repr is None -> ShapeType

inst is IfcProfileDef and repr is None -> ShapeType

inst is IfcPlacement / IfcObjectPlacement -> Transformation

inst is IfcTypeProduct and repr is None -> None

inst is IfcTypeProduct and repr is provided -> RuntimeError

(for IfcTypeProducts provide just IfcRepresentation as inst).

If ‘use-python-opencascade’ is enabled in settings then

instead of ShapeElementType it returns shape_tuple,

instead of ShapeType it returns TopoDS.TopoDS_Shape.

Example:

settings = ifcopenshell.geom.settings()
settings.set(settings.USE_PYTHON_OPENCASCADE, True)

ifc_file = ifcopenshell.open(file_path)
products = ifc_file.by_type("IfcProduct")

for i, product in enumerate(products):
if product.Representation is not None:
try:
created_shape = geom.create_shape(settings, inst=product)
shape = created_shape.geometry # see #1124
shape_gpXYZ = shape.Location().Transformation().TranslationPart() # These are methods of the TopoDS_Shape class from pythonOCC
print(shape_gpXYZ.X(), shape_gpXYZ.Y(), shape_gpXYZ.Z()) # These are methods of the gpXYZ class from pythonOCC
except:
print("Shape creation failed")
ifcopenshell.geom.iterate(settings: iterate.settings, file_or_filename: ifcopenshell.file.file | str, num_threads: int = 1, include: list[ifcopenshell.entity_instance.entity_instance] | list[str] | None = None, exclude: list[ifcopenshell.entity_instance.entity_instance] | list[str] | None = None, with_progress: Literal[False] = False, cache: serializers.hdf5 | None = None, geometry_library: GEOMETRY_LIBRARY = 'opencascade') → Generator[IteratorOutput, None, None]
ifcopenshell.geom.iterate(settings: iterate.settings, file_or_filename: ifcopenshell.file.file | str, num_threads: int = 1, include: list[ifcopenshell.entity_instance.entity_instance] | list[str] | None = None, exclude: list[ifcopenshell.entity_instance.entity_instance] | list[str] | None = None, with_progress: Literal[True] = True, cache: serializers.hdf5 | None = None, geometry_library: GEOMETRY_LIBRARY = 'opencascade') → Generator[tuple[int, IteratorOutput], None, None]
ifcopenshell.geom.iterate(settings: iterate.settings, file_or_filename: ifcopenshell.file.file | str, num_threads: int = 1, include: list[ifcopenshell.entity_instance.entity_instance] | list[str] | None = None, exclude: list[ifcopenshell.entity_instance.entity_instance] | list[str] | None = None, with_progress: bool = False, cache: serializers.hdf5 | None = None, geometry_library: GEOMETRY_LIBRARY = 'opencascade') → Generator[IteratorOutput | tuple[int, IteratorOutput], None, None]
ifcopenshell.geom.make_shape_function(fn)
ifcopenshell.geom.transform_string(v: str | serializers.buffer) → serializers.buffer
ifcopenshell.geom.wrap_shape_creation(settings, shape)
ifcopenshell.geom.GEOMETRY_LIBRARY
ifcopenshell.geom.IteratorOutput
ifcopenshell.geom.SERIALIZER_SETTING
ifcopenshell.geom.SETTING
ifcopenshell.geom.ShapeElementType
ifcopenshell.geom.ShapeType
ifcopenshell.geom.T
ifcopenshell.geom.has_occ
ifcopenshell.geom.serialise
ifcopenshell.geom.tesselate

ifcopenshell.draw
2D drawing generation and serialisation

Module Contents
class ifcopenshell.draw.draw_settings
auto_elevation: bool = False
auto_floorplan: bool = True
auto_section: bool = False
cache: bool = False
cells: bool = True
css: bool = True
door_arcs: bool = False
drawing_guid: str
drawing_object_type: str
exclude_entities: str = 'IfcOpeningElement'
height: float = 420.0
hlr_poly: bool = False
include_curves: bool = False
include_entities: str = ''
include_projection: bool = True
merge_cells: bool = False
prefilter: bool = True
profile_threshold: int
scale: float
space_areas: bool = False
space_names: bool = False
storey_heights: str = 'none'
subtract_before_hlr: bool = False
unify_inputs: bool = True
width: float = 297.0
ifcopenshell.draw.main(settings: draw_settings, files: list[ifcopenshell.file], iterators: Sequence[ifcopenshell.geom.iterator] = (), merge_projection: bool = True, progress_function: Callable = DO_NOTHING)
ifcopenshell.draw.DO_NOTHING
ifcopenshell.draw.W
ifcopenshell.draw.WHITE
ifcopenshell.draw.times = []

ifcopenshell.guid
Reads and writes encoded GlobalIds

IFC entities may be identified using a unique ID (called a UUID or GUID). This 128-bit label is often represented in the form xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. However, in IFC, it is also usually stored as a 22 character base 64 encoded string. This module lets you convert between these representations and generate new UUIDs.

Module Contents
ifcopenshell.guid.compress(g)
ifcopenshell.guid.expand(g)
ifcopenshell.guid.new()
ifcopenshell.guid.split(g)
ifcopenshell.guid.chars

ifcopenshell.validate
Data validation module

Can be used to run validation on IFC file from the command line:

python -m ifcopenshell.validate /path/to/model.ifc --rules
Available flags:

--rules: Also check express rules.

--json: Produce JSON output.

--fields: Output more detailed information about failed entities (available only with --json).

Module Contents
exception ifcopenshell.validate.ValidationError(message, attribute=None)
Bases: Exception

Common base class for all non-exit exceptions.

attribute
class ifcopenshell.validate.LogDetectionHandler(level=NOTSET)
Bases: logging.Handler

Handler instances dispatch logging events to specific destinations.

The base handler class. Acts as a placeholder which defines the Handler interface. Handlers can optionally use Formatter instances to format records as desired. By default, no formatter is specified; in this case, the ‘raw’ message as determined by record.message is logged.

Initializes the instance - basically setting the formatter to None and the filter list to empty.

emit(record)
Do whatever it takes to actually log the specified logging record.

This version is intended to be implemented by subclasses and so raises a NotImplementedError.

message_logged = False
class ifcopenshell.validate.json_logger
log(level, message, \*args)
set_state(key, value)
state
statements = []
ifcopenshell.validate.annotate_inst_attr_pos(inst: ifcopenshell.entity_instance, pos: int) → str
ifcopenshell.validate.assert_valid(attr_type: attribute_types, val: Any, schema: schema_definition, no_throw=False, attr: attribute | None = None)
ifcopenshell.validate.assert_valid_inverse(attr: inverse_attribute, val: tuple[ifcopenshell.entity_instance], schema: schema_definition) → bool
ifcopenshell.validate.format(val: Any) → str
ifcopenshell.validate.get_entity_attributes(schema: schema_definition, entity: str) → tuple[entity_type, tuple[attribute]]
ifcopenshell.validate.get_select_members(schema: schema_definition, ty: select_type) → set[str]
ifcopenshell.validate.log_internal_cpp_errors(f: ifcopenshell.file, filename: str, logger: logging.Logger) → None
ifcopenshell.validate.validate(f: ifcopenshell.file | str, logger: logging.Logger, express_rules=False) → None
For an IFC population model f (or filepath to such a file) validate whether the entity attribute values are correctly supplied. As this is a function that is applied after a file has been parsed, certain types of errors in syntax, duplicate numeric identifiers or invalidate entity names are not caught by this function. Some of these might have been logged and can be retrieved by calling ifcopenshell.get_log(). A verification of the type, entity and global WHERE rules is also not implemented.

For every entity instance in the model, it is checked that the entity is not abstract that every attribute value is of the correct type and that the inverse attributes are of the correct cardinality.

Express simple types are checked for their valuation type. For select types it is asserted that the value conforms to one of the leaves. For enumerations it is checked that the value is indeed on of the items. For aggregations it is checked that the elements and the cardinality conforms. Type declarations (IfcInteger which is an integer) are unpacked until one of the above cases is reached.

It is recommended to supply the path to the file, so that internal C++ errors reported during the parse stage are also captured.

Example:

logger = ifcopenshell.validate.json_logger()
ifcopenshell.validate.validate("/path/to/model.ifc", logger, express_rules=True)
from pprint import pprint
pprint(logger.statements)
ifcopenshell.validate.aggregation_type
ifcopenshell.validate.attribute
ifcopenshell.validate.attribute_types
ifcopenshell.validate.entity_attribute_map: dict[tuple[str, str], tuple[entity_type, tuple[attribute]]]
ifcopenshell.validate.entity_type
ifcopenshell.validate.enumeration_type
ifcopenshell.validate.filenames
ifcopenshell.validate.inverse_attribute
ifcopenshell.validate.log_entry_type
ifcopenshell.validate.named_type
ifcopenshell.validate.schema_definition
ifcopenshell.validate.select_members_cache: dict[tuple[str, str], set[str]]
ifcopenshell.validate.select_type
ifcopenshell.validate.simple_type
ifcopenshell.validate.simple_type_python_mapping
ifcopenshell.validate.type_declaration
