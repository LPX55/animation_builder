module.exports = function ({
  bundleName = 'Text Animator',
  bundleId = 'com.pixflow.textanimator',
  version = '1.0.0',
  hosts,
  bundleVersion = '1.0.0',
  cepVersion = '6.0',
  width = '500',
  height = '500',
  cefParams = [
    '--enable-nodejs',
    '--mixed-context',
    '--proxy-auto-detect',
    '--allow-file-access-from-files',
    '--allow-file-access'
  ],
  icon: { normal = '', rollover = '', darkNormal = '', darkRollover = '' },
}) {
  const commandLineParams = cefParams.map(
    cefParam => `<Parameter>${cefParam}</Parameter>`
  );

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <ExtensionManifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ExtensionBundleId="${bundleId}" ExtensionBundleName="${bundleName}" ExtensionBundleVersion="${bundleVersion}" Version="${cepVersion}">
    <ExtensionList>
      <Extension Id="${bundleId}" Version="${version}"/>
    </ExtensionList>
    <ExecutionEnvironment>
      <HostList>
      <Host Name="PPRO" Version="[12.0,99.9]" />
			<Host Name="AEFT" Version="[15.0,99.9]" />
      </HostList>
      <LocaleList>
        <Locale Code="All"/>
      </LocaleList>
      <RequiredRuntimeList>
        <RequiredRuntime Name="CSXS" Version="${cepVersion}"/>
      </RequiredRuntimeList>
    </ExecutionEnvironment>
    <DispatchInfoList>
      <Extension Id="${bundleId}">
        <DispatchInfo>
          <Resources>
            <MainPath>./dist/index.html</MainPath>
            <CEFCommandLine>
              ${commandLineParams.join('\n            ')}
            </CEFCommandLine>
          </Resources>
          <Lifecycle>
            <AutoVisible>true</AutoVisible>
          </Lifecycle>
          <UI>
            <Type>Panel</Type>
            <Menu>Text Animator</Menu>
            <Geometry>
              <Size>
                <Height>${height}</Height>
                <Width>${width}</Width>
              </Size>
            </Geometry>
            <Icons>
              <Icon Type="Normal">${normal}</Icon>
              <Icon Type="RollOver">${rollover}</Icon>
              <Icon Type="DarkNormal">${darkNormal}</Icon>
              <Icon Type="DarkRollOver">${darkRollover}</Icon>
            </Icons>
          </UI>
        </DispatchInfo>
      </Extension>
    </DispatchInfoList>
  </ExtensionManifest>`;
};
