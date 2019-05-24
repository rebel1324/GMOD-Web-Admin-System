warn = warn or {}


if (SERVER) then
    local meta = FindMetaTable('Player')
    local warnKey = "webwarn" 

    /*
                t: warningDuration,
                s: steamID64,
                a: adminID,
                r: reason
    */
    local succ = sock
    sock:addHook("warn", function(sock, packet)
        local body = packet:ReadString() || ""
        local info = util.JSONToTable(body)

        local steamID = info.s
        local result = false

        xpcall(function()
            print("Got request to issue warn on ID: " .. steamID)

            local client = player.GetBySteamID64(steamID)
            if (not client) then
                print("Failed to find player.")
            else
                result = true
                print("Found player " .. client:Name())

                local curWarns = client:GetNW2Int(warnKey, 0)
                client:SetNW2Int(warnKey, curWarns + 1)
                hook.Run("OnPlayerWarn", client, info, curWarns + 1)
            end
        end, function(error)
            print(error)
        end)

        local packet = BromPacket()
        packet:WriteString(result == true and "1" or "0")
        sock:Send(packet)
    end)

    sock:addHook("unwarn", function(sock, packet)
        local body = packet:ReadString() || ""
        local info = util.JSONToTable(body)

        local steamID = info.s
        local result = false

        xpcall(function()
            print("Got request to issue unwarn on ID: " .. steamID)

            local client = player.GetBySteamID64(steamID)
            if (not client) then
                print("Failed to find player.")
            else
                result = true
                print("Found player " .. client:Name())

                local curWarns = client:GetNW2Int(warnKey, 0)
                client:SetNW2Int(warnKey, curWarns - 1)
                hook.Run("OnPlayerUnwarn", client, info, curWarns - 1)
            end
        end, function(error)
            print(error)
        end)

        local packet = BromPacket()
        packet:WriteString(result == true and "1" or "0")
        sock:Send(packet)
    end)

    hook.Add("PlayerInitialSpawn", "getWarns", function(client)
        http.Fetch("http://127.0.0.1/api/warn/get/" .. client:SteamID64(),
            function( body, len, headers, code )
                local data = util.JSONToTable(body)

                client:SetNW2Int(warnKey, data.count)
            end,
            function(error)

            end
        )
    end)

    hook.Add("OnPlayerUnwarn", "warnAnnounce", function(client, info, warnCount)
        client:ChatPrint(string.format("당신의 경고 하나가 사라졌습니다.",
            duration,
            reason
        ))
    end)

    hook.Add("OnPlayerWarn", "warnAnnounce", function(client, info, warnCount)
        local duration, admin, reason = info.t, info.a, info.r

        for _, recipient in pairs(player.GetAll()) do
            if (recipient != client) then
                recipient:ChatPrint(string.format("관리자에 의해서 %s(%s)님이 경고를 받았습니다. (이유: %s)",
                    client:Name(),
                    client:steamName(),
                    reason
                ))
            else
                recipient:ChatPrint(string.format("당신은 관리자에 의해 경고를 받았습니다. %s초 뒤 경고는 자연 소멸합니다. (이유: %s).",
                    duration,
                    reason
                ))
                recipient:ChatPrint(string.format("현재 누적 경고 횟수는 %s 입니다. 3회 경고를 받을시 경고를 받을 때마다 강제퇴장처리 됩니다.",
                    warnCount
                ))
            end
        end

        if (warnCount > 3 and not client:IsAdmin()) then
            client:Kick("경고 횟수가 3회를 초과하여 강퇴되셨습니다.")
        end
    end)
end

