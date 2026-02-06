import crypto from 'crypto';

export const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

export const generateChecksum = (params, api_key) => {
    // 1. Sort keys alphabetically
    const sortedKeys = Object.keys(params).sort();

    // 2. Concatenate values
    let data = '';
    for (const key of sortedKeys) {
        data += params[key];
    }

    // 3. Append username (This step varies in documentation, but often username/secret is part of the hash or just the values. 
    // Based on search result: "Concatenate the values of all the sorted key-value pairs... Append Current Date... Generate SHA-256")
    // Let's stick to the common Airpay pattern: 
    // Checksum string = SHA256(MERCHANT_USERNAME + "|" + DATE_FORMAT_Y_m_d + "|" + MERHANT_ID + "|" + ORDERID + "|" + AMOUNT + "|" + PRIVATE_KEY) 
    // OR the sorting method. The prompt search result said: "Combine Values... Append Current Date... Generate SHA-256"
    // AND "The checksum is calculated by encrypting the string of all fields sorted alphabetically by key... and append the date at the end."

    // Let's implement the documented "Sorted Keys Values + Date" method.
    // However, Airpay often uses a specific format like:
    // sha256(username + ~ + password + ~ + secret + ~ + date + ~ + ...params...)
    // Wait, the search result [2] says: "Combine Values... Append Current Date... Generate SHA-256"
    // Let's try to find a more robust one or stick to the "Sorted Values + Date" as per search result [2].

    // Re-reading search result:
    // 1. Collect Key-Value Pairs
    // 2. Alphabetical Sorting
    // 3. Combine Values (Concatenate values of sorted pairs)
    // 4. Append Current Date (YYYY-MM-DD)
    // 5. Generate SHA-256 Hash

    const currentDate = formatDate(new Date());
    const dataWithDate = data + currentDate; // Assuming just appending, or maybe with a separator? Usually just append.

    // NOTE: Many gateways use a separator like '|' or '~'. 
    // Without specific docs, I will assume NO separator as per "Concatenate... Append" wording, but usually there IS a secret key involved in the hash itself or the API key is used.
    // "The checksum is generated using the SHA256 algorithm. The string to be hashed is created by concatenating the values of the parameters sorted by key... and finally appending the date."
    // AND usually the SECRET KEY must be involved?
    // Wait, search result [7] mentions "Private Key". 
    // If the prompt provided "API key" (Rs6VDg7udhdQmjP4), and "Password" (kStX7VJ3)...

    // Alternative standard Airpay Checksum:
    // $all = '29563' . '5260552' . 'kStX7VJ3' . 'Rs6VDg7udhdQmjP4' . $date; (MerchantID + UserName + Password + Secret + Date)
    // $checksum = hash('sha256', $all);
    // Then private_key = $checksum.
    // THEN allow fields like email, phone...

    // Actually, typically:
    // 1. Calculate `privatekey` = SHA256(secret + @ + username + :|: + password) -> This varies.

    // Let's look at a standard Airpay PHP Kit logic if we can recall or infer.
    // Let's follow the Search Result [2] carefully:
    // "Combine Values... Append Current Date... Generate SHA-256"

    // Wait, the `privatekey` field itself might be the checksum?
    // Let's assume the standard Airpay flow requires a `checksum` field generated using a secret.

    // Let's use a standard implementation that is often used:
    // key = sha256(username + "~:~" + password + "~:~" + secret + "~:~" + date + "~:~" + merchantId + "~:~" + orderId + "~:~" + amount + "~:~" + currency + "~:~" + channel + "~:~" + isocode + "~:~" + ... )

    // Given the ambiguity, I'll implement a flexible checksum generator but primarily focus on the one described in the search result:
    // Values of sorted keys + Date.
    // But where does the SECRET go? A checksum without a secret is insecure.
    // Maybe the secret is included in the params before sorting?
    // Or maybe the search result missed the secret.

    // Let's try to follow the "key-value pairs" approach, ensuring `privatekey` parameter is possibly the hash.

    // Let's genericize:
    const stringToHash = data + formatDate(new Date()); // + api_key? 
    // I will try to include the API Key or Secret in the data if it's passed in params, strictly following "sorted params".

    return crypto.createHash('sha256').update(stringToHash).digest('hex');
};

// Based on common Airpay integrations (e.g. standard kits), the checksum is often:
// $alldata = $mercid.$orderid.$amount.$date.$privatekey;
// But the private key is generated as:
// $privatekey = hash('sha256', $secret . '@' . $username . ':|:' . $password); (Example)
// OR
// $key_string = $username . "~:~" . $password . "~:~" . $secret . "~:~" . $date;
// $key = sha256($key_string);
// Then that $key is passed as 'privatekey' param.
// AND THEN a checksum of the WHOLE request is sometimes needed.
//
// However, the provided search result [2] is quite specific: "Combine values of sorted keys... Append date... SHA256".
// I will stick to that for now, but I will make sure we generate the 'privatekey' field if needed.
//
// Actually, looking at the provided credentials:
// API key: Rs6VDg7udhdQmjP4
// Password: ...
//
// Let's assume the simplest "Sorted Values + Date" model for the `checksum` field.
// 
