import {Icon, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import IconOrigin from "ol/style/IconOrigin";
import {getTextWidth} from "../../utils";
import {COLORS} from "../../constants/constants";
const images = require.context('../../../public/flags', false, /\.png$/);

export const VESSEL_NAME_STYLE = 100
export const VESSEL_SELECTOR_STYLE = 200

export const setVesselIconStyle = (vessel, iconFeature, selectedFeature, vesselNamesShowedOnMap) => {
    let selectedVesselFeatureToUpdate = null;
    const vesselDate = new Date(vessel.dateTime);
    const nowMinusThreeHours = new Date();
    nowMinusThreeHours.setHours(nowMinusThreeHours.getHours() - 3);

    let opacity = vesselDate < nowMinusThreeHours ? 0.3 : 1;
    let styles = []
    const iconStyle = new Style({
        image: vessel.speed > 0.1 ? new Icon({
            src: 'boat_mf.png',
            offset: [0, 0],
            imgSize: [14, 14],
            rotation: vessel.course,
            opacity: opacity
        }) : new CircleStyle({
            radius: 4,
            fill: new Fill({
                color: `rgba(5, 5, 94, ${opacity})`
            })
        })
    });
    styles.push(iconStyle)

    if (vesselNamesShowedOnMap) {
        styles.push(getVesselNameStyle(iconFeature))
    }

    if (vessel.internalReferenceNumber && selectedFeature && vessel.internalReferenceNumber === selectedFeature.getProperties().internalReferenceNumber) {
        styles.push(selectedVesselStyle)
        selectedVesselFeatureToUpdate = iconFeature
    }

   iconFeature.setStyle(styles);
    return selectedVesselFeatureToUpdate
}

export const selectedVesselStyle =  new Style({
    image: new Icon({
        opacity: 1,
        src: 'select.png',
        scale: 0.4
    }),
    zIndex: VESSEL_SELECTOR_STYLE
})

const getSVG = feature => {
    //const flag = feature.getProperties().flagState ? Flags.byId[feature.getProperties().flagState.toLowerCase()].data : null
    const flag = images(`./${feature.getProperties().flagState.toLowerCase()}.png`)
    const textWidth = getTextWidth(feature.getProperties().vesselName) + 10 + (flag ? 18 : 0)

    let iconSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="${textWidth}px" height="36px" viewBox="0 0 ${textWidth} 16"  xml:space="preserve">
            <rect x="0" y="0" width="${textWidth}" height="16" rx="8px" fill="#FFFFFF" />
            <image xlink:href="${flag}" width="14px" x="5px" height="16px"/>
            <text x="${flag ? 23 : 5}" y="13" fill="${COLORS.grayDarkerThree}" font-family="Arial" font-size="12" font-weight="normal">${feature.getProperties().vesselName}</text>
        </svg>`;

    let imageElement = new Image();
    imageElement.src = 'data:image/svg+xml,' + escape(iconSVG);

    return imageElement
}

export const getVesselNameStyle = feature => new Style({
    image: new Icon({
        anchorOrigin: IconOrigin.TOP_RIGHT,
        img: getSVG(feature),
        imgSize: [getTextWidth(feature.getProperties().vesselName)*4, 36],
        offset: [-getTextWidth(feature.getProperties().vesselName)*2 - 10, 11]
    }),
    zIndex: VESSEL_NAME_STYLE
})

export const setCircleStyle = (color, arrowFeature) => {
    const arrowStyle = new Style({
        image: new CircleStyle({
            radius: 3,
            fill: new Fill({
                color: color
            })
        })
    });
    arrowFeature.setStyle(arrowStyle);
}

export const setArrowStyle = (trackArrow, arrowFeature) => {
    const arrowStyle = new Style({
        image: new Icon({
            src: trackArrow,
            offset: [0, 0],
            imgSize: [20, 34],
            scale: 0.6,
            rotation: arrowFeature.getProperties().course
        }),
    });

    arrowFeature.setStyle((feature, resolution) => {
        arrowStyle.getImage().setScale(1 / Math.pow(resolution, 1/4));
        return arrowStyle;
    });
}