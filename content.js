let showAttendanceTime = true; // Default to true

// Request the initial state from the background script
chrome.runtime.sendMessage(
  { type: "getShowAttendanceTime" },
  function (response) {
    if (response !== undefined && response.showAttendanceTime !== undefined) {
      showAttendanceTime = response.showAttendanceTime;
      // Update the toggle switch state accordingly
      const toggleSwitch = document.getElementById("toggleAttendanceTime");
      if (toggleSwitch) {
        toggleSwitch.checked = showAttendanceTime;
      }
    }
  }
);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "updateShowAttendanceTime") {
    showAttendanceTime = message.showAttendanceTime;
    updateAttendanceTimePeriodically();
  }
});

function calculateAttendanceTime(callback) {
  try {
    // const alertInfo = document.querySelector(".alert.alert-info");
    // if (alertInfo && showAttendanceTime) {
    //   const timeString = alertInfo.querySelector("b").innerText.trim();
    //   const [hours, minutes, period] = timeString.split(/:| /);
    //   let hours24 = parseInt(hours, 10);
    //   if (period === "PM") {
    //     hours24 += 12;
    //   }
    //   const minutes24 = parseInt(minutes, 10);
    //   const attendanceTime = new Date();
    //   attendanceTime.setHours(hours24, minutes24, 0, 0);

    //   const currentTime = new Date();
    //   const differenceMilliseconds = currentTime - attendanceTime;

    //   const differenceHours = Math.floor(
    //     differenceMilliseconds / (1000 * 60 * 60)
    //   );
    //   const differenceMinutes = Math.floor(
    //     (differenceMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    //   );

    //   const formattedDifference = `${differenceHours} hours ${differenceMinutes} minutes`;

    //   callback(null, formattedDifference);
    // } else {
    //   callback("Attendance time not found or not enabled.", null);
    // }

    var ulList = document.querySelectorAll("ul")[0];
    var liList = ulList.querySelectorAll("li")[8];
    var selectName = liList.querySelectorAll("a")[0].innerText.trim();

    var selectTable = document.querySelectorAll("table")[0];
    var selectedRowIndex = null;
    console.log(selectName);

    selectTable.querySelectorAll("tr").forEach(function (row, index) {
      row.querySelectorAll("td").forEach(function (cell) {
        console.log(cell.innerText.trim().includes(selectName));
        if (cell.innerText.trim().includes(selectName)) {
          selectedRowIndex = index;
          console.log("Index of selected row:", selectedRowIndex);
          return; // exit the forEach loop once found
        }
      });
    });

    if (selectedRowIndex !== null) {
      const selectRow = selectTable.querySelectorAll("tr")[selectedRowIndex];
      const selectTime = selectRow.querySelectorAll("td")[2].innerText.trim();
      const selectEndTime = selectRow
        .querySelectorAll("td")[3]
        .innerText.trim();
      console.log("Time:", selectTime);

      if (selectEndTime && selectEndTime.length > 3) {
        const [hours, minutes, period] = selectTime.split(/:| /);
        const [hoursEnd, minutesEnd, periodEnd] = selectEndTime.split(/:| /);
        let hours24 = parseInt(hours, 10);
        if (period === "PM") {
          hours24 += 12;
        }
        const minutes24 = parseInt(minutes, 10);
        const attendanceTime = new Date();
        attendanceTime.setHours(hours24, minutes24, 0, 0);

        let hoursEnd24 = parseInt(hoursEnd, 10);
        if (periodEnd === "PM") {
          hoursEnd24 += 12;
        }
        const minutesEnd24 = parseInt(minutesEnd, 10);
        const endTime = new Date();
        endTime.setHours(hoursEnd24, minutesEnd24, 0, 0);

        const differenceMilliseconds = endTime - attendanceTime;

        const differenceHours = Math.floor(
          differenceMilliseconds / (1000 * 60 * 60)
        );
        const differenceMinutes = Math.floor(
          (differenceMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
        );

        const formattedDifference = `${differenceHours} hours ${differenceMinutes} minutes`;
        console.log(formattedDifference);
        callback(null, formattedDifference);
      } else {
        const [hours, minutes, period] = selectTime.split(/:| /);
        let hours24 = parseInt(hours, 10);
        if (period === "PM") {
          hours24 += 12;
        }
        const minutes24 = parseInt(minutes, 10);
        const attendanceTime = new Date();
        attendanceTime.setHours(hours24, minutes24, 0, 0);

        const currentTime = new Date();
        const differenceMilliseconds = currentTime - attendanceTime;

        const differenceHours = Math.floor(
          differenceMilliseconds / (1000 * 60 * 60)
        );
        const differenceMinutes = Math.floor(
          (differenceMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
        );

        const formattedDifference = `${differenceHours} hours ${differenceMinutes} minutes`;
        console.log(formattedDifference);
        callback(null, formattedDifference);
      }
    }
  } catch (error) {
    console.error("Error calculating attendance time:", error);
    callback(error.message || "Error calculating attendance time.", null);
  }
}

function updateAttendanceTimeOnPage(attendanceTime) {
  const existingDiv = document.querySelector(".attendance-time-div");
  if (existingDiv) {
    existingDiv.textContent = "Today you spent at nascenia: " + attendanceTime;
  } else {
    const alertInfo = document.querySelector(".alert.alert-info");
    if (alertInfo && showAttendanceTime) {
      const div = document.createElement("div");
      div.className = "attendance-time-div";
      div.textContent = "Today you spent at nascenia: " + attendanceTime;
      div.style.padding = "10px";
      div.style.backgroundColor = "#f0f0f0";
      div.style.marginTop = "-10px";
      div.style.marginBottom = "15px";
      div.style.borderRadius = "5px";
      div.style.border = "1px solid #ddd";
      alertInfo.insertAdjacentElement("afterend", div);
    }
  }
}

function updateAttendanceTimePeriodically() {
  if (showAttendanceTime) {
    calculateAttendanceTime((error, result) => {
      if (error) {
        console.error(error);
      } else {
        console.log(result);
        updateAttendanceTimeOnPage(result);
      }
    });
  }
}

// Check the status of the toggle switch periodically and send a message to the background script to update the state
setInterval(() => {
  const toggleSwitch = document.getElementById("toggleAttendanceTime");
  if (toggleSwitch) {
    showAttendanceTime = toggleSwitch.checked;
    chrome.runtime.sendMessage({
      type: "updateShowAttendanceTime",
      showAttendanceTime,
    });
  }
}, 1000);

// Call the function initially
updateAttendanceTimePeriodically();

// Set interval for updating attendance time periodically
setInterval(updateAttendanceTimePeriodically, 60000);
