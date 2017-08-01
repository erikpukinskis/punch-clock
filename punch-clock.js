var library = require("module-library")(require)

module.exports = library.export(
  "punch-clock",
  function() {
      var sessionsByTaskId = {}
      var sessionsByCharacterId = {}

      function addToList(lists, id, newItem) {
        var list = lists[id]
        if (!list) {
          list = lists[id] = []
        }
        list.push(newItem)
      }

      var punchClock = {
        start: function(name, characterId, taskId, startTime) {
          var session = {name: name, characterId: characterId, taskId: taskId, startTime: startTime}

          addToList(sessionsByTaskId, taskId, session)
          addToList(sessionsByCharacterId, characterId, session)
        },
        getCurrentAssignmentId: function(characterId) {
          var sessions = sessionsByCharacterId[characterId]
          if (!sessions) { return }
          var session = sessions[sessions.length-1]
          var hasStopped = !!session.stopTime
          debugger
          if (hasStopped) {
            return
          } else {
           return session.taskId
          }
        },
        stop: function(name, characterId, taskId, stopTime) {
          var sessions = sessionsByCharacterId[characterId]
          var session = sessions[sessions.length-1]
          if (session.taskId != taskId) {
            throw new Error("Trying to clock out of "+taskId+" but clocked into "+session.taskId)
          }
          session.stopTime = stopTime
        },
        sessionsForTask: function(taskId) {
          return sessionsByTaskId[taskId] || []
        }
    }

    return punchClock
  }
)