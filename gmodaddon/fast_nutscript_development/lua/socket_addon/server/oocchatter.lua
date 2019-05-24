util.AddNetworkString("oocChatter")

hook.Add("PlayerMessageSend", "socketAdd", function(speaker, chatType, text, anonymous, receivers)
    if (chatType == "ooc") then
        sock:node("oocChat",function(packet)
            local char = speaker:getChar()
            
            if (char) then
                local class = char:getClass()
                local classTable = nut.class.list[class]
                local color = classTable.color

                packet:WriteString(util.TableToJSON({
                    uid = speaker:SteamID64(),
                    name = speaker:Name(),
                    txt = text,
                    col = "#" .. bit.tohex(color.r, 2) .. bit.tohex(color.g, 2) .. bit.tohex(color.b, 2),
                }))
            end
        end)
    end
end)

local succ = sock
sock:addHook("socketChat", function(sock, packet)
    local str = packet:ReadString()
    local data = util.JSONToTable(str)

    if (data) then
        net.Start("oocChatter")
            net.WriteTable(data)
        net.Broadcast()
        
        local packet = BromPacket()
        packet:WriteString(util.TableToJSON({
            name = data.name,
            txt = data.text,
            col = "#000000",
        }))
        sock:Send(packet)
    end
end)