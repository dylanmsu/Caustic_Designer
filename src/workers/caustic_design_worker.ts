const { parentPort } = require('worker_threads');

const {loadImage, runTransportIteration, runHeightIteration, getErrorGrid, initializeTransportSolver, initializeHeightSolver, getParameterizationSvg, getObjString} = require('../../caustic_engineering/build/Release/CausticEngineering.node');

let aspect_ratio = 0.0;

parentPort.on('message', async message => {
    if (message.type === 'loadImage') {
        

        aspect_ratio = message.data.width / message.data.height;
        
        /*let max_value = pixel_intensities_1d[0];
        let min_value = pixel_intensities_1d[0];

        for (let i=0; i<width*height; i++) {
            if (min_value >= pixel_intensities_1d[i]) {min_value = pixel_intensities_1d[i];}
            if (max_value <= pixel_intensities_1d[i]) {max_value = pixel_intensities_1d[i];}
        }

        for (let i=0; i<width*height; i++) {
            pixel_intensities_1d[i] = (pixel_intensities_1d[i] - min_value) / (max_value - min_value);
        }*/
        
        var ret = loadImage(message.data.ImageData, message.data.width, message.data.height);

        //parentPort.postMessage(['ok'])
        parentPort.postMessage({type: 'imageUrl', data: message.data.imageBuffer});
    }

    if (message.type === 'start-transport') {
        initializeTransportSolver(message.data.mesh_resolution, aspect_ratio, message.data.lens_width);

        parentPort.postMessage({type: 'svg-data', data: getParameterizationSvg()});

        for (let i=0; i<100; i++) {
            let step_size = runTransportIteration();
    
            /*let grid = getErrorGrid();
    
            let output = ndarray(new Float32Array((message.data.mesh_resolution*4) * (message.data.mesh_resolution*4 * aspect_ratio) * 4), [message.data.mesh_resolution*4, message.data.mesh_resolution*4*aspect_ratio, 4]);
            for (let y = 0; y < message.data.mesh_resolution*4*aspect_ratio; ++y) {
                for (let x = 0; x < message.data.mesh_resolution*4; ++x) {
                    output.set(x, y, 0, grid[y * message.data.mesh_resolution*4 + x] * 255.0)
                    output.set(x, y, 1, grid[y * message.data.mesh_resolution*4 + x] * 255.0)
                    output.set(x, y, 2, grid[y * message.data.mesh_resolution*4 + x] * 255.0)
                    output.set(x, y, 3, 255.0)
                }
            }
        
            const imageOut = await savePixels(output, 'image/png');
        
            const imageDataURL = `data:image/png;base64,${imageOut.toString('base64')}`;*/
        
            parentPort.postMessage({type: 'svg-data', data: getParameterizationSvg()});
            parentPort.postMessage({type: 'step-size', data: Math.round(step_size * 10000) / 10000});
            
            // convergance check
            if (step_size < 0.0005) break;
        }

        parentPort.postMessage({type: 'transport-done'})
    }

    if (message.type === 'start-height') {
        initializeHeightSolver(message.data.focal_l, message.data.thickness);

        for (let i=0; i<5; i++) {
            let step_size = runHeightIteration();

            parentPort.postMessage({type: 'step-size', data: Math.round(step_size * 10000) / 10000});
        }

        parentPort.postMessage({type: 'height-done', data: getObjString()});
    }

    if (message.type === 'get-svg-param') {
        initializeTransportSolver(100, 1, 1);
        parentPort.postMessage({type: 'SVG', data: getParameterizationSvg()});
        //parentPort.postMessage({type: 'SVG', data: 'hello'});
    }
});