self.addEventListener("install", function (event) {
  // Perform some task
  console.log("User can install");
});

self.addEventListener("offline", function (event) {
  // Perform some task
  console.log("user is now offline");
});
