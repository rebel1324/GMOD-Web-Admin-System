net.Receive("oocChatter", function(len)
    local data = net.ReadTable()
    
    if (data.power > 0) then
        chat.AddText(Color(255, 50, 50), "[WEB어드민] ", Color(155, 111, 111), data.name, ": ", color_white, data.text)
    else
        chat.AddText(Color(222, 222, 222), "[WEB OOC] ", Color(222, 222, 222), data.name, ": ", color_white, data.text)
    end
end)