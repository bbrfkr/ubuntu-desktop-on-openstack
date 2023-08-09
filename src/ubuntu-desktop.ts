import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { getOpenstackProvider } from '../lib';
import { ComputeInstanceV2 } from '../.gen/providers/openstack';

export class UbuntuDesktopStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);


    // define resources here
    getOpenstackProvider(this);

    const userData = `#!/bin/sh
      export DEBIAN_FRONTEND=noninteractive

      # os update
      apt -y update && apt -y upgrade

      # mount volume
      mount /dev/vdb /mnt
      if [ ! -d "/mnt/ubuntu" ]; then
        cp -pr /home/ubuntu /mnt
      fi
      umount /mnt
      echo '/dev/vdb /home ext4 defaults 0 0' >> /etc/fstab

      # install nvidia driver
      apt -y install nvidia-driver-535

      # install desktop
      apt -y install ubuntu-desktop
      apt -y install xrdp
      sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
      wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
      apt -y update
      apt install google-chrome-stable

      # reboot host
      reboot
    `;

    new ComputeInstanceV2(this, 'UbuntuDesktop', {
      name: 'ubuntu-desktop',
      imageName: 'ubuntu-jammy',
      flavorName: 'p1.6xlarge',
      keyPair: 'bbrfkr',
      securityGroups: ['allow-all'],
      network: [{ name: 'common' }],
      userData: userData,
      blockDevice: [
        {
          uuid: "ac0d794a-2067-43ed-b726-af10ae0814b5",
          sourceType: "image",
          destinationType: "local",
          bootIndex: 0,
          volumeSize: 200,
          deleteOnTermination: true,
        },
        {
          uuid: "449acaa4-6dc2-449d-abb6-93ebe04d2478",
          sourceType: "volume",
          destinationType: "volume",
          bootIndex: 1,
          deleteOnTermination: false,
        }
      ]
    });
  }
}
