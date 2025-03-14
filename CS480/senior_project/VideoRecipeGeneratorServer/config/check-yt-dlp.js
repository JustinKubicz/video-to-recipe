import { execSync, exec } from "child_process";
//https://nodejs.org/api/child_process.html#child_processexecsynccommand-options
exec("yt-dlp --version", (error, stdout) => {
  if (error) {
    console.log("installing yt-dlp cli dependency");
    exec("pip --version", (error, stdout) => {
      if (error) {
        console.error("python is required to install");
      } else {
        execSync("python3 -m pip install -U 'yt-dlp[default]'");
        exec("yt-dlp --version", (error, stdout) => {
          if (error) {
            console.error("yt-dlp failed to install");
          } else {
            console.log(`yt-dlp installed: ${stdout}`);
          }
        });
      }
    });
  } else {
    console.log(`yt-dlp is already installed: ${stdout}`);
  }
});
