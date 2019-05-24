local aprint = print

local function print(str)
    aprint("[BROM:Mod] " .. str)
end

local succ = sock
sock:addHook("kickID", function(sock, packet)
	local body = packet:ReadString() || ""
    local result = false

    xpcall(function()
        local info = util.JSONToTable(body)
        local steamID = info.steamID
        print("Got request to kick ID: " .. steamID)

        local client = player.GetBySteamID64(steamID)

        if (not client) then
            print("Failed to find player.")
        else
            result = true
            print("Found player " .. client:Name())
            client:Kick(info.reason or "웹 관리 시스템에 의해 강제퇴장.")
        end
    end, function(error)
        print(error)
    end)

	local packet = BromPacket()
	packet:WriteString(result == true and "1" or "0")
	sock:Send(packet)
end)