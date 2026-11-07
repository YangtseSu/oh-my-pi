import { describe, expect, test } from "bun:test";
import { getBundledModel } from "@oh-my-pi/pi-catalog/models";
import { getSttModelSpec } from "../../src/stt/models";
import {
	TTS_LOCAL_VOICE_VALUES,
	getTtsLocalModelSpec,
	resolveTtsSpeakerId,
	resolveTtsVoice,
} from "../../src/tts/models";

describe("local speech model registry", () => {
	test("registers the sherpa Kokoro Chinese model and its voices", () => {
		const spec = getTtsLocalModelSpec("kokoro-zh");
		expect(spec?.engine).toBe("sherpa");
		expect(spec?.voices.map(voice => voice.id)).toContain("zf_001");
		expect(resolveTtsVoice("kokoro-zh", "af_heart")).toBe("zf_001");
		expect(resolveTtsSpeakerId("kokoro-zh", "zf_001")).toBe(3);
		expect(resolveTtsSpeakerId("kokoro-zh", "zm_010")).toBe(59);
		expect(TTS_LOCAL_VOICE_VALUES).toContain("zf_002");
		expect(TTS_LOCAL_VOICE_VALUES).toContain("zm_015");
	});

	test("registers the X-ASR streaming dictation tier", () => {
		const spec = getSttModelSpec("x-asr-960ms-zh-en");
		if (spec?.engine !== "sherpa") throw new Error("x-asr must be a sherpa model");
		expect(spec.mode).toBe("online");
		expect("tailPaddingSeconds" in spec ? spec.tailPaddingSeconds : undefined).toBe(1.5);
		expect(spec.files).toEqual({
			encoder: "encoder.int8.onnx",
			decoder: "decoder.onnx",
			joiner: "joiner.int8.onnx",
			tokens: "tokens.txt",
		});
	});

	test("publishes both models in the bundled catalog under their roles", () => {
		expect(getBundledModel("local", "kokoro-zh")?.kind).toBe("tts");
		expect(getBundledModel("local", "x-asr-960ms-zh-en")?.kind).toBe("stt");
	});
});
