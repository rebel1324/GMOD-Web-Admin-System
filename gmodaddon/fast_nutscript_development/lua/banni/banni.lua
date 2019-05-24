banni = banni or {}
function banni:IsValid()
    return true 
end

local meta = FindMetaTable('Player')

function meta:fuckoff(time)
    banni:fuckoff(self, time)
end

function meta:isBanned()
    return self:GetNW2Bool("banni") == true
end

/*
    Banni Restrictions.
*/
if (SERVER) then
    function banni:PlayerSay(client, message)
        if (client:isBanned()) then
            if (not nut) then return end
            
	        local chatType, message, anonymous = nut.chat.parse(client, message, true)
        
            if (chatType == 'ooc') then
                client:ChatPrint("제한 모드에서는 OOC를 사용할 수 없습니다.")
                return false
            end

            if (client.banniChat and client.banniChat > RealTime()) then
                client:ChatPrint("제한 모드에서는 모든 채팅을 30초마다 쓸 수 있습니다.")
                return false
            else
                client.banniChat = RealTime() + 30
            end
        end
    end

    function banni:PlayerSpawnProp(client)
        if (client:isBanned()) then
            return false
        end
    end
end

local banniBlackList = {
    ["+attack"] = true,
    ["+attack2"] = true,
    ["+speed"] = true,
    ["+jump"] = true,
    ["+crouch"] = true,
    ["+reload"] = true,
}
if (CLIENT) then
    function banni:PlayerBindPress(client, bind, press)
        if (client:isBanned()) then
            if (banniBlackList[bind]) then
                return true
            end
        end
    end
else
    function banni:StartCommand(client, userCmd)
        if (client:isBanned()) then
            userCmd:RemoveKey(IN_ATTACK)
            userCmd:RemoveKey(IN_ATTACK2)
            userCmd:RemoveKey(IN_RELOAD)
            userCmd:RemoveKey(IN_JUMP)
            userCmd:RemoveKey(IN_DUCK)
            userCmd:RemoveKey(IN_SPEED)
        end
    end
end

function banni:PlayerCanHearPlayersVoice(_, client)
    if (client:isBanned()) then
        return false
    end
end

function banni:PlayerSpawnProp(client)
    if (client:isBanned()) then
        return false
    end
end

function banni:CanTool(client)
    if (client:isBanned()) then
        return false
    end
end

function banni:CanPlayerJoinClass(client, class, classData)	
    if (client:isBanned()) then
		return false, "banned"
	end
end

hook.Run("updatebanni")