function nextKeyExtractionCode(linkHeader) {
    const parts = linkHeader.split(',');  // Split by commas to handle multiple links
    for (const part of parts) {
      if (part.includes('rel="next"')) {
        const urlMatch = part.match(/<([^>]+)>/);
        if (urlMatch && urlMatch[1]) {
          return urlMatch[1];  // Return the URL for "next"
        }
      }
    }
    return null;  // Return null if no "next" link is found
}
console.log(nextKeyExtractionCode('<https://api.github.com/repositories?since=600290>; rel="next", <https://api.github.com/repositories{?since}>; rel="first"'));
