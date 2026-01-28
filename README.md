# Region File Viewer Website
A website that allows you to load a region file (world/region/r.x.z.mca) and view information about that region, chunks inside the region, blocks, entities, etc

# How to Use
Go to https://minecraft-region-file-viewer.netlify.app/view/ and click `Choose File`
When select a mca file, go to a world you'd like to view in your .minecraft folder (look it up on google, should be soemthing like %appdata%)
the folder at `.minecraft/saves/WORLD NAME TO VIEW/region/` will have a list of mca files you can import and see

# What do the colors mean?
If you use inspect element, you can check the classes of any square and it'll tell you the status, chunks like minecraft:full are completely generated and are white, whilesome like minecraft:lights is a light orangeish-yellow meaning the server is still generating light level data for that chunk.
