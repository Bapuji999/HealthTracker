function CreateDateString(daysRequired) {
    const estimatedDaysRequired = Math.ceil(daysRequired);
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + estimatedDaysRequired);

    // Options for formatting: "23 Jun 2025"
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const futureDateString = futureDate.toLocaleDateString('en-GB', options);

    return futureDateString;
}

function calculateFatLossUI() {
    const currentBodyFat = parseFloat(document.getElementById('currentBodyFat').value);
    const requiredFatPercent = parseFloat(document.getElementById('requiredFatPercent').value);
    const currentBodyWeight = parseFloat(document.getElementById('currentBodyWeight').value);
    const recordedDecreasedWeight = parseFloat(document.getElementById('recordedDecreasedWeight').value);
    const recordedDateDuration = parseFloat(document.getElementById('recordedDateDuration').value);

    if (isNaN(currentBodyFat) || isNaN(requiredFatPercent) || isNaN(currentBodyWeight) ||
        isNaN(recordedDecreasedWeight) || isNaN(recordedDateDuration)) {
        alert("Please fill all fields correctly.");
        return;
    }

    const currentFatDecimal = currentBodyFat / 100;
    const requiredFatDecimal = requiredFatPercent / 100;

    const currentLeanMass = currentBodyWeight * (1 - currentFatDecimal);
    const requiredBodyWeight = currentLeanMass / (1 - requiredFatDecimal);
    const fatToReduce = currentBodyWeight - requiredBodyWeight;
    const daysRequired = (recordedDateDuration / recordedDecreasedWeight) * fatToReduce;

    document.getElementById('resultRequiredBodyWeight').innerText = requiredBodyWeight.toFixed(2);
    document.getElementById('resultFatToReduce').innerText = fatToReduce.toFixed(2);
    document.getElementById('resultEstimatedDaysRequired').innerText = CreateDateString(daysRequired);

    document.getElementById('fatLossResults').classList.remove('hidden');
}