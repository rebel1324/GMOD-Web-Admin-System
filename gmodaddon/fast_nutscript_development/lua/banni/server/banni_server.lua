function banni:loadBanniData(steamID)
    local d = deferred.new()

    http.Fetch('http://127.0.0.1/api/ban/get/' .. steamID, function(body)
        local data = util.JSONToTable(body)

        local banRecord = data and data.data and data.data[1]

        if (banRecord) then
            d:resolve({true, tonumber(banRecord.duration)})
        else
            d:resolve({false, 0})
        end
    end, function(error)
    
    end)

    return d
end

function banni:updateBanniData(steamID, bool, duration, reason, adminID)
    if (bool) then
        local client = player.GetBySteamID64(steamID)

        http.Post('http://127.0.0.1/api/ban/update', {
            steamID = steamID,
            adminID = adminID,
            lastName = IsValid(client) and client:Name() or "",
            reason = reason,
            duration = "" .. os.time() + duration, // what in the fuck is this?
            durationActual = "" .. duration // what in the fuck is this?
        }, function(body)
            local data = util.JSONToTable(body)
        end, function(error)
            
        end)
    else
        http.Post('http://127.0.0.1/api/ban/lift', {
            steamID = steamID,
            adminID = adminID,
        }, function(body)
            local data = util.JSONToTable(body)
        end, function(error)
            
        end)
    end
end

function banni:getTimerName(client)
    return "bannied"..client:SteamID64()
end

function banni:unbanTimer(client, timeLeft)
    local steamID = client:SteamID64()

    timer.Create(self:getTimerName(client), timeLeft, 1, function()
        if (IsValid(client)) then
            self:unfuckoff(client)
        end
    end)
end

function banni:PlayerInitialSpawn(client)
    local steamID = client:SteamID64()

    self:loadBanniData(steamID):next(function(record)
        local isBanned, untilWhen = unpack(record)

        if (isBanned) then
            if (untilWhen > os.time()) then    
                client:SetNW2Bool("banni", true)
                client:SetNW2Int("banniLeft", untilWhen)

                local time = untilWhen - os.time()
                self:unbanTimer(client, time)
            end
        end
    end, function(error)
    end)
end

function banni:fuckoff(client, time, reason, who, fromServer)
    if (IsValid(client) and type(time) == 'number') then
        local steamID = client:SteamID64()
        
        if (not fromServer) then
            self:updateBanniData(steamID, true, time, reason, IsValid(who) and who:SteamID64() or '')
        end
        self:unbanTimer(client, time)
        client:SetNW2Bool("banni", true)
        client:SetNW2Int("banniLeft", os.time() + time)

        print("[BANNI] " .. client:steamName() .. " got banni.")
        hook.Run("OnPlayerBanni", true, client, time)
    end
end

function banni:unfuckoff(client, fromServer)
    if (IsValid(client)) then
        local steamID = client:SteamID64()

        if (not fromServer) then
            self:updateBanniData(steamID, false, 0)
        end

        client:SetNW2Bool("banni", nil)
        timer.Destroy(self:getTimerName(client))

        hook.Run("OnPlayerBanni", false, client)
        print("[BANNI] " .. client:steamName() .. " got unbanni.")
    end
end 

local function niceTime(time)
    local seconds = time % 60
    local minutes = math.floor(time/60)

    if (minutes > 0) then
        local smin = math.floor(minutes%60)
        local hours = math.floor(minutes/60)

        if (hours > 0) then
            return hours .. "시간 " .. smin .. "분 " .. seconds .. "초"
        else
            return minutes .. "분 " .. seconds .. "초"
        end
    else
        return seconds .. "초"
    end
end

function banni:OnPlayerBanni(bool, client, time)
    local char = client:getChar()

    if (char) then
        char:setClass(CLASS_CIVILIAN)
    end

    if (bool) then
        client:ChatPrint("당신은 관리자에 의해 " .. niceTime(time) .. " 동안 제한 모드가 되었습니다.")
    else
        client:ChatPrint("당신은 제한 모드가 풀렸습니다.")
    end
end

function banni:rewardTime()

end

function banni:getBanned()
    local r = {}
    for _, client in pairs(player.GetAll()) do
        if (client:GetNW2Bool("banni", false) == true) then
            table.insert(r, client)
        end
    end
end

local limit = 55
function banni:CheckPassword(steamID)
    self:loadBanniData(steamID):next(function(record)
        local isBanned, untilWhen = unpack(record)

        if (untilWhen > os.time()) then
            if (isBanned) then
                if (#player.GetAll() > limit) then
                    return false, "제한된 플레이어는 " .. limit .. "명 이상일때 들어올 수 없습니다."
                end
            else
                if (#player.GetAll() > limit) then
                    local banni = table.Random(self:getBanned())

                    if (IsValid(banni)) then
                        banni:Kick("제한 되지 않은 플레이어를 위한 자리 확보 (자동)")
                    end
                end
            end
        end
    end, function(error)
    end)
end

function banni:PlayerAuthed( client, steamid, uniqueid )
	print( client:Name() .. " has been authenticated as " .. steamid .. "." )
end

function banni:CanPlayerChangeJob(client)
    if (client:isBanned()) then
        return false
    end
end

/*
    s: steamID,
    a: adminID,
    r: reason,
    d: time
*/
sock:addHook("banPlayer", function(sock, packet)
	local body = packet:ReadString() || ""
    local result = false 

    xpcall(function()
        local info = util.JSONToTable(body)
        local steamID, adminID, reason, time = info.s, info.a, info.r, info.d
        print("Got request to ban ID: " .. steamID)

        local client = player.GetBySteamID64(steamID)

        if (IsValid(client)) then
            banni:fuckoff(client, time, reason, adminID, true)
        end
    end, function(error)
        print(error)
    end)

	local packet = BromPacket()
	packet:WriteString(result == true and "1" or "0")
	sock:Send(packet)
end)

sock:addHook("unbanPlayer", function(sock, packet)
	local body = packet:ReadString() || ""
    local result = false

    xpcall(function()
        local info = util.JSONToTable(body)
        local steamID, adminID, reason, time = info.s, info.a, info.r, info.d
        print("Got request to unban ID: " .. steamID)

        local client = player.GetBySteamID64(steamID)

        if (IsValid(client)) then
            banni:unfuckoff(client, true)
        end
    end, function(error)
        print(error)
    end)

	local packet = BromPacket()
	packet:WriteString(result == true and "1" or "0")
	sock:Send(packet)
end)

for id, func in pairs(banni) do
    if (type(func) == 'function') then
        hook.Add(id, banni, func)  
    end
end
hook.Add('updatebanni', 'updatebanni', function()
    for id, func in pairs(banni) do
        if (type(func) == 'function') then
            hook.Add(id, banni, func)  
        end
    end
end)


gameevent.Listen("player_disconnect")
