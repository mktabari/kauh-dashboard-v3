import SSH2Promise from "ssh2-promise";
process.on("message", ({ ip, username, password }) => {
  const ssh = new SSH2Promise({
    host: ip,
    username: username,
    password: password,
  });
  try {
    ssh
      .exec(`df -h|grep -v Filesystem|tr -s ' '|cut -d" " -f 2,3,4,5,6`)
      .then((data) => {
        data = data.toString("utf-8").split("\n");
        data.pop();
        data = data
          .map((line) => {
            const [size, used, avail, usePercent, filesystem] = line.split(" ");
            return { usePercent, size, used, filesystem, avail };
          })
          .filter((item) => item.size !== "0K")
          .sort(
            (a, b) =>
              parseInt(
                b.size
                  .replace("M", "")
                  .replace("G", "000")
                  .replace("T", "000000")
                  .replace(".", ""),
              ) -
              parseInt(
                a.size
                  .replace("M", "")
                  .replace("G", "000")
                  .replace("T", "000000")
                  .replace(".", ""),
              ),
          );
        process.send(data);
      });
  } catch (err) {
    console.error("worker space error", err);
    process.send("error");
  }
});
