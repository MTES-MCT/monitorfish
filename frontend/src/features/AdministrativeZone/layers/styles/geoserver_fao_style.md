# Geoserver FAO style

The `fao_areas` layer is served as a Geoserver `wms` layer.

For `geowebcache` to be running under `/wms` routes, the `WMS` caching direct integration must be setup:
https://docs.geoserver.org/stable/en/user/geowebcache/webadmin/defaults.html#enable-direct-integration-with-geoserver-wms

The style (named `FAO style`) is defined as the following SLD:
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:se="http://www.opengis.net/se">
  <NamedLayer>
    <Name>FAO areas layer</Name>
    <UserStyle>
      <Name>FAO areas</Name>
      <Title>FAO Areas</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>Line</Name>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#767ab2</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>Text</Name>
          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>f_code</ogc:PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-size">12</CssParameter>
            </Font>
            <Halo>
              <Fill>
                <CssParameter name="fill">#ffffff</CssParameter>
              </Fill>
            </Halo>
            <Fill>
              <CssParameter name="fill">#282F3E</CssParameter>
              <CssParameter name="fill-opacity">1</CssParameter>
            </Fill>
          </TextSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
```
