import {Icon, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";

export const setVesselIconStyle = (vessel, iconFeature, vesselTrackInternalReferenceNumberToShow) => {
    const vesselDate = new Date(vessel.dateTime);
    const nowMinusThreeHours = new Date;
    nowMinusThreeHours.setHours(nowMinusThreeHours.getHours() - 3);

    let opacity = vesselDate < nowMinusThreeHours ? 0.3 : 1;
    const iconStyle = new Style({
        image: vessel.speed > 0 ? new Icon({
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

   if (vessel.internalReferenceNumber === vesselTrackInternalReferenceNumberToShow) {
       iconFeature.setStyle([iconStyle, selectedVesselStyle]);
   } else {
       iconFeature.setStyle(iconStyle);
   }
}

export const selectedVesselStyle =  new Style({
    image: new Icon({
        opacity: 1,
        src: 'select.png',
        scale: 0.4
    })
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
        arrowStyle.getImage().setScale(1 / Math.pow(resolution, 1/6));
        return arrowStyle;
    });
}