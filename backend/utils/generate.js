const generateCredentials = (firstName, lastName, fatherName, dob) => {
    // Ensure inputs are strings to prevent errors
    const fName = firstName ? firstName.toString() : "";
    const lName = lastName ? lastName.toString() : "";
    const dadName = fatherName ? fatherName.toString() : "";
    
    // --- 1. Generate User ID ---
    // Logic: First 4 chars of Firstname + Last 1 char of Lastname (All Small)
    const part1 = fName.trim().substring(0, 4).toLowerCase();
    const part2 = lName.trim().slice(-1).toLowerCase();
    const generatedUserId = `${part1}${part2}`;

    // --- 2. Generate Password ---
    // Logic: First 4 chars of Fathername + # + DOB Date (All Small)
    // Extract Day from DOB (Assuming YYYY-MM-DD format)
    // If dob is "1990-05-12", split gives ["1990", "05", "12"] -> take index 2
    const dobDate = dob ? dob.split('-')[2] : ""; 

    const passPart1 = dadName.trim().substring(0, 4).toLowerCase();
    const passPart2 = "#";
    const passPart3 = dobDate;
    
    const generatedPassword = `${passPart1}${passPart2}${passPart3}`;

    return { generatedUserId, generatedPassword };
};

module.exports = { generateCredentials };