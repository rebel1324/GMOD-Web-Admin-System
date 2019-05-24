if SERVER then
	print("[ADDON] Initalized Addons")

	for _, addon in pairs(engine.GetAddons())do
		if addon.mounted == true and addon.downloaded == true then
			resource.AddWorkshop(tostring(addon.wsid))
		end
	end
end