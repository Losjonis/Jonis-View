const CPU = { name: 'Procesador', args: ['-c:v','libx264','-preset','veryfast','-crf','20'] };
const GPU = [
  { name: 'NVIDIA NVENC', args: ['-c:v','h264_nvenc','-preset','p4','-rc','vbr','-cq','20','-b:v','0'] },
  { name: 'Intel Quick Sync', args: ['-c:v','h264_qsv','-preset','fast','-global_quality','20'] },
  { name: 'AMD AMF', args: ['-c:v','h264_amf','-quality','speed','-rc','cqp','-qp_i','20','-qp_p','22'] }
];
module.exports = function createExporter(run) {
  let detection;
  const unavailable = new Set();
  function detect() {
    return detection ||= (async () => {
      const available=[];
      for(const encoder of GPU) {
        try {
          // Listing encoders is insufficient: exercise the driver with actual frames.
          await run(['-f','lavfi','-i','color=size=640x480:rate=30','-frames:v','3',...encoder.args,'-pix_fmt','nv12','-f','null','-'],false,8000).done;
          available.push(encoder);
        } catch {}
      }
      return available;
    })();
  }
  async function info() { const encoders=(await detect()).filter(e=>!unavailable.has(e.name));return { available:encoders.length>0, name:encoders[0]?.name || CPU.name }; }
  async function encode(input, output, useGpu, notify=()=>{}) {
    const options=useGpu ? [...(await detect()).filter(e=>!unavailable.has(e.name)),CPU] : [CPU];
    for(const encoder of options) {
      notify(encoder.name);
      try {
        await run([...input,'-map','0:v:0','-map','0:a?',...encoder.args,'-pix_fmt',encoder===CPU?'yuv420p':'nv12','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:a','aac','-movflags','+faststart',output]).done;
        return encoder.name;
      } catch(error) {
        if(encoder===CPU) throw error;
        unavailable.add(encoder.name);
      }
    }
  }
  return {info,encode};
};

