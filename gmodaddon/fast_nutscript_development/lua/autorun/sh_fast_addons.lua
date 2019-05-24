-- This is for fast nutscript development - hotswapping
local function MakeEnum(filename)
	_G["NUTSCRIPT_" .. filename:Left(-5):upper()] = true
end

local function load_files(dir)
	for _, luafile in pairs((file.Find(dir .. "/*.lua", "LUA"))) do
		local path = string.format(dir .. "/%s", luafile)
		
		include(path)
		
		if SERVER then
			AddCSLuaFile(path)
		end
	end

	for _, luafile in pairs((file.Find(dir .. "/client/*.lua", "LUA"))) do
		local path = string.format(dir .. "/client/%s", luafile)
		
		if CLIENT then
			include(path)
		end

		if SERVER then
			AddCSLuaFile(path)
		end
	end

	if SERVER then
		for _, luafile in pairs((file.Find(dir .. "/server/*.lua", "LUA"))) do
			MakeEnum(luafile)
			include(string.format(dir .. "/server/%s", luafile))
		end
	end
end

load_files("modules")
load_files("nutscript")
load_files("outfitter")
load_files("socket")
load_files("socket_addon")
load_files("banni")
load_files("html_test")
load_files("mutator")