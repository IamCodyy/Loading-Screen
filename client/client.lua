local loadingComplete = false

RegisterNetEvent("modernLoading:updateProgress")

AddEventHandler("modernLoading:updateProgress", function(progress, resource)
    SendNUIMessage({ action = "progress", progress = progress, resource = resource })
end)

RegisterNetEvent("modernLoading:finish")
AddEventHandler("modernLoading:finish", function()
    if loadingComplete then return end
    loadingComplete = true
    SendNUIMessage({ action = "complete" })
end)

local function getLoadingStatus()
    local total = GetNumResources()
    local started = 0
    local loadingResource = "Loading resources"

    for i = 0, total - 1 do
        local resName = GetResourceByFindIndex(i)
        local resState = GetResourceState(resName)

        if resState == "started" then
            started = started + 1
        elseif loadingResource == "Loading resources" then
            loadingResource = resName
        end
    end

    return total, started, loadingResource
end

CreateThread(function()
    local lastProgress = -1

    while true do
        local totalResources, startedResources, currentResource = getLoadingStatus()
        local progress = totalResources > 0 and math.floor((startedResources / totalResources) * 100) or 100

        if progress ~= lastProgress then
            TriggerEvent("modernLoading:updateProgress", progress, currentResource)
            lastProgress = progress
        end

        if startedResources >= totalResources then
            Wait(1000)
            TriggerEvent("modernLoading:finish")
            break
        end

        Wait(100)
    end
end)