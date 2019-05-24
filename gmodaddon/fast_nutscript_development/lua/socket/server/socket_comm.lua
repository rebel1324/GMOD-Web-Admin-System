

// fucking sockets
require("bromsock")

sock = sock or {}

-- Node address
sock.nodeServerInfo = {
	address = "127.0.0.1",
	port = 6994 --8080
}

sock.hooks = sock.hooks or {}

if sock.sock then
	sock.sock:Close()
	print("[TCP=] Closed sock")
end
function sock:init(port)
	local sock=BromSock(BROMSOCK_TCP)
	if sock:Listen(port) then
		print("[TCP+] Listening on port "..port)

		sock:SetCallbackAccept(function(...) self:listen(...) end)
		sock:Accept()
		self.sock = sock
	else
		print("[TCP-] Failed to bind port "..port)
	end

	hook.Run("OnSocketReady")
end

function sock:listen(serversock, clientsock)
	clientsock:SetCallbackReceive(function(...)
		self:receive(...)
	end) -- Start accepting requests
	clientsock:SetTimeout(10000)
	clientsock:Receive()
	serversock:Accept()
end

function sock:receive(sock, packet)
	local handle = packet:ReadString()
	print("[TCP+] Received handle " .. handle)

	local handler = self.hooks[handle]
	if handler then
		handler(sock, packet)
	end
	sock:Close()
	sock:Receive()
end

function sock:addHook(handle,func)
	if handle and func and type(handle)=="string" and type(func)=="function" then
		self.hooks[handle]=func
		return true
	else
		return false
	end
end

function sock:node(handle,func)
	local web = self.nodeServerInfo
	if web then
		self:send(handle,func,web.address,web.port)
		return true
	else
		return false
	end
end

function sock:send(handle,func,address,port)
	local packet = BromPacket()
	packet:WriteString(handle)
	if func then
		func(packet)
	end
	local sock = BromSock(BROMSOCK_TCP)
	sock:SetCallbackConnect(function(sock,ret,ip,port)
		sock:Send(packet:Copy())
		sock:Close()
	end)
	sock:Connect(address,port)
end

sock:init(7974) -- listen port

local aprint = print
local function print(str)
	aprint("[BROM:Util] " .. str)
end

sock:addHook("echo", function(sock,packet)
	local str = packet:ReadString()
	print("[TCP+] Recieved echo: " .. str)

	sock:node("echo",function(packet)
		packet:WriteString(str)
	end)
end)

sock:addHook("getPlayers", function(sock, packet)
	print("Requested player list.")

	local players = {}
	for _, client in pairs(player.GetAll()) do
		players[client:SteamID64()] = {
			n = client:Name(),
			rn = client:steamName(),
			a = client:IsAdmin()
		}
	end

	local packet = BromPacket()
	packet:WriteString(util.TableToJSON(players))
	sock:Send(packet)
end)

sock:addHook("serverTime", function(sock, packet)
	local packet = BromPacket()
	packet:WriteString("" .. os.time())
	sock:Send(packet)
end)