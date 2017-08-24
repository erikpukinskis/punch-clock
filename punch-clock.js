var library = require("module-library")(require)

module.exports = library.export(
  "punch-clock",
  ["identifiable"],
  function(identifiable) {
      var sessions = {}
      var sessionsByTaskId = {}
      var sessionsByCharacterId = {}

      function addToList(lists, id, newItem) {
        var list = lists[id]
        if (!list) {
          list = lists[id] = []
        }
        list.push(newItem)
      }

      var LAST = -1

      function getFromList(set, reference, index) {
        var list = set[reference]
        if (!list) { return }
        if (index == LAST) {
          index = list.length - 1
        }
        return list[index]
      }

      var punchClock = {
        start: function(name, characterId, taskId, startTime) {
          var session = {name: name, characterId: characterId, taskId: taskId, startTime: startTime}

          var id = identifiable.assignId(sessions)

          sessions[id] = session

          addToList(sessionsByTaskId, taskId, id)
          addToList(sessionsByCharacterId, characterId, id)
        },
        getCurrentAssignmentId: function(characterId) {
          var sessionId = getFromList(sessionsByCharacterId, characterId, LAST)
          var session = sessions[sessionId]

          if (!session) { return }

          var hasStopped = !!session.stopTime

          if (hasStopped) {
            return
          } else {
           return session.taskId
          }
        },
        stop: function(name, characterId, taskId, stopTime) {
          var sessionId = getFromList(sessionsByCharacterId, characterId, LAST)
          var session = sessions[sessionId]

          if (session.taskId != taskId) {
            throw new Error("Trying to clock out of "+taskId+" but clocked into "+session.taskId)
          }
          session.stopTime = stopTime

          return sessionId
        },
        minutes: function(sessionId) {
          var session = sessions[sessionId]
          if (!session.stopTime) {
            throw new Error("Punch clock session "+sessionId+" hasn't ended")
          }
          var milliseconds = new Date(session.stopTime) - new Date(session.startTime)
          var minutes = milliseconds/1000/60
          if (minutes < 0.5) { return 0 }
          return Math.ceil(minutes)
        },
        describe: function(sessionId) {
          var session = sessions[sessionId]
          return session.name+" (id "+session.characterId+") worked for "+punchClock.minutes(sessionId)+" minutes"
        },
        eachSessionOnTask: function(taskId, callback) {
          var ids = sessionsByTaskId[taskId] || []
          for(var i=0; i<ids.length; i++) {
            var id = ids[i]
            callback(sessions[id])
          }
        }
    }

    return punchClock
  }
)