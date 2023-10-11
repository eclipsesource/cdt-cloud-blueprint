# OpenOCD installation for cdt-cloud-blueprint#osweek-pico

See official OpenOCD repo for more details: <https://github.com/raspberrypi/openocd>

## Steps

- cd ~/pico/
- Optional: delete or rename existing openocd installation directory
- git clone git://git.code.sf.net/p/openocd/code openocd
- cd openocd
- ./bootstrap
- ./configure
- make
- sudo make install
- Switch to cdt-cloud-blueprint application
  - Ensure that the setting `Openocd: Path` (Settings Workspace - Extensions - Pico) is set to the installation directory ~/pico/openocd (or revert to default value)
