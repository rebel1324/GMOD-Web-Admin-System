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

function banni:HUDPaint()
    local sx, sy = ScrW()/2, ScrH()/4*3

    if (LocalPlayer():isBanned()) then
        local text = "처벌 중: 제한 모드"
        draw.DrawText(text, "nutBigFont", sx, sy+1, color_black, TEXT_ALIGN_CENTER)
        draw.DrawText(text, "nutBigFont", sx, sy, Color(255, 110, 110), TEXT_ALIGN_CENTER)
        
        local time = LocalPlayer():GetNW2Int('banniLeft')
        if (time) then
        text = "남은 시간: " .. niceTime(time - os.time())
        draw.DrawText(text, "nutBigFont", sx, sy+31, color_black, TEXT_ALIGN_CENTER)
        draw.DrawText(text, "nutBigFont", sx, sy+30, Color(255, 110, 110), TEXT_ALIGN_CENTER)
        end

        local time = LocalPlayer():GetNW2Int('banniLeft')
        if (time) then
        text = "당신은 해당 시간까지 상호작용을 하지 못하며, 서버 인원 50명 접속 시 자동으로 쫓겨납니다."
        draw.DrawText(text, "nutSmallFont", sx, sy+70 + 1, color_black, TEXT_ALIGN_CENTER)
        draw.DrawText(text, "nutSmallFont", sx, sy+70 + 0, Color(255, 110, 110), TEXT_ALIGN_CENTER)
        end
    end
end

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

timer.Simple(5, function()
    gameevent.Listen("player_disconnect")

    hook.Add("player_disconnect", "atlaschat.DisconnectMessage", function(data)

    end)


    net.Receive("atlaschat.plcnt", function(bits)

    end)
end)