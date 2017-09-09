// ==UserScript==
// @name        MusicBrainz: Generate event setlist
// @author      Kebabpizza
// @namespace   Kebabpizza
// @description musicbrainz.org: Generate event setlist from relationships
// @match       *://*.musicbrainz.org/event/*/edit
// @match       *://*.musicbrainz.org/event/create
// @match       *://*.mbsandbox.org/event/*/edit
// @match       *://*.mbsandbox.org/event/create
// @version     2017-09-10
// @grant       none
// ==/UserScript==

let allNightContainer = $("<div class='row no-label'></div>'")
let allNightLabel = $("<label for='allNight'>All night</label>")
let allNightButton = $("<input type='checkbox' id='allNight' />")
let appendContainer = $("<div class='row no-label'></div>'")
let appendLabel = $("<label for='append'>Append</label>")
let appendButton = $("<input type='checkbox' id='append' />")
let goContainer = $("<div class='row no-label buttons' style='margin-top: 0 !important; margin-bottom: 0 !important' />")
let goBtn = $("<button class='submit positive' type='button'>Generate setlist</button>")
let textarea = $("textarea")[0]

allNightButton.appendTo(allNightContainer)
allNightLabel.appendTo(allNightContainer)

appendButton.appendTo(appendContainer)
appendLabel.appendTo(appendContainer)

allNightContainer.insertAfter(textarea)
appendContainer.insertAfter(allNightContainer)

goBtn.appendTo(goContainer)
goContainer.insertAfter(appendContainer)

goBtn[0].addEventListener('click', generateEventList)

function generateEventList() {
    let performances = []
    let hosts = []

    $("tbody tr").each(function (index) {
        let th = $(this).find("th")
        if (th.length == 0) {
            return
        }
        let headerText = th.find("label").text()

        // English only :(
        if (headerText == "main performers:") {
            $(this).find(".relationship-list > div").each(function (index) {
                if ($(this).find("a").length == 0) {
                    return
                }

                let performance = {}

                performance.artist = _.unescape($(this).find("bdi")[0].innerHTML)
                let artistLink = $(this).find("a")[0].href
                performance.artistMBID = artistLink.split("/").splice(-1)[0]

                let text = $(this)[0].innerHTML
                let pattern = /time: (.*)\</gi
                let time = pattern.exec(text)[1]

                performance.time = time.replace("-", " – ")

                performances.push(performance)
            })
        } else if (headerText == "hosts:") {
            $(this).find(".relationship-list > div").each(function (index) {
                if ($(this).find("a").length == 0) {
                    return
                }

                let host = {}

                host.artist = _.unescape($(this).find("bdi")[0].innerHTML)
                let artistLink = $(this).find("a")[0].href
                host.artistMBID = artistLink.split("/").splice(-1)[0]

                hosts.push(host)
            })
        }
    })

    let isAllNight = allNightButton[0].checked
    performances = performances.sort(function(a, b) {
        let timea = a.time.split(" ")[0]
        let timeb = b.time.split(" ")[0]

        let datea = timea[0] == "0" && isAllNight ? "1/1/2" : "1/1/1"
        let dateb = timeb[0] == "0" && isAllNight ? "1/1/2" : "1/1/1"

        return new Date(datea + " " + timea) - new Date(dateb + " " + timeb)
    })

    if (!appendButton[0].checked) {
        textarea.value = ""
    } else {
        textarea.value = textarea.value + "\n"
    }

    for (let performance of performances) {
        let output = "@" + " " + performance.time + " [" + performance.artistMBID + "|" + performance.artist + "]\n"
        textarea.value = textarea.value + output
    }

    for (let host of hosts) {
        let output = "@ Hosted by [" + host.artistMBID + "|" + host.artist + "]"
        textarea.value = textarea.value + output
    }
}