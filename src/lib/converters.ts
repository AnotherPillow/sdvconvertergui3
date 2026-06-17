import type BaseConverter from "./converter/base";
import BFAV2CP from "./converter/BFAV2CP";
import CM2CP from "./converter/CM2CP";
import MTN2CP from "./converter/MTN2CP";
import TMXL2CP from "./converter/TMXL2CP";
import CPA2SC from "./converter/CPA2SC";
import type { Manifest } from "./types";
import SAAT2CP from "./converter/SAAT2CP";

interface Converter {
    Name: string;
	Needs16: boolean;
	Repo: string;
	GitFile: string;
	InputDirectory: string;
	OutputDirectory: string;
	RequirementsFile: string;
	SupportedUniqueID: string;
	ExtraArgs: string;
    Convert?: typeof TMXL2CP | typeof BFAV2CP | typeof CM2CP | typeof MTN2CP | typeof CPA2SC | typeof SAAT2CP;
}

export default [
    {
        Name:              "TMXL2CP",
        Needs16:           true,
        Repo:              "https://github.com/AnotherPillow/TMXL2CP",
        GitFile:           "https://github.com/AnotherPillow/TMXL2CP.git",
        InputDirectory:    "TMXL",
        OutputDirectory:   "CP",        RequirementsFile:  "requirements.txt",
        SupportedUniqueID: "platonymous.tmxloader",
        ExtraArgs:         "",
        Convert:           TMXL2CP,
    },
    
    {
        Name:              "BFAV2CP",
        Needs16:           false,
        Repo:              "https://github.com/AnotherPillow/BFAV2CP",
        GitFile:           "https://github.com/AnotherPillow/BFAV2CP.git",
        InputDirectory:    "input",
        OutputDirectory:   "output",        RequirementsFile:  "requirements.txt",
        SupportedUniqueID: "paritee.betterfarmanimalvariety",
        ExtraArgs:         "",
        Convert:           BFAV2CP,
    },
    
    {
        Name:              "CM2CP",
        Needs16:           false,
        Repo:              "https://github.com/AnotherPillow/CM2CP",
        GitFile:           "https://github.com/AnotherPillow/CM2CP.git",
        InputDirectory:    "input",
        OutputDirectory:   "output",        RequirementsFile:  "requirements.txt",
        SupportedUniqueID: "platonymous.custommusic",
        ExtraArgs:         "",
        Convert:           CM2CP
    },
    
    {
        Name:              "STF2CP",
        Needs16:           false,
        Repo:              "https://github.com/AnotherPillow/STF2CP",
        GitFile:           "https://github.com/AnotherPillow/STF2CP.git",
        InputDirectory:    "input",
        OutputDirectory:   "output",        RequirementsFile:  "requirements.txt",
        SupportedUniqueID: "cherry.shoptileframework",
        ExtraArgs:         "",
    },
    
    {
        Name:              "FurnitureConverter",
        Needs16:           false,
        Repo:              "https://github.com/elizabethcd/FurnitureConverter",
        GitFile:           "https://github.com/elizabethcd/FurnitureConverter.git",
        InputDirectory:    "input",
        OutputDirectory:   "output-1.6",
        RequirementsFile:  "requirements.txt",
        SupportedUniqueID: "platonymous.customfurniture",
        ExtraArgs:         "--inputDir input --outputDir output",
    },
    
    {
        Name:              "CP2AT",
        Needs16:           false,
        Repo:              "https://github.com/holy-the-sea/CP2AT",
        GitFile:           "https://github.com/holy-the-sea/CP2AT.git",
        InputDirectory:    "input",
        OutputDirectory:   "output",        RequirementsFile:  "requirements.txt",
        SupportedUniqueID: "pathoschild.contentpatcher",
        ExtraArgs:         "",
    },
    
    {
        Name:              "CPA2SC",
        Needs16:           false,
        Repo:              "https://github.com/AnotherPillow/CPA2SC",
        GitFile:           "https://github.com/AnotherPillow/CPA2SC.git",
        InputDirectory:    "input",
        OutputDirectory:   "output",        RequirementsFile:  "requirements.txt",
        SupportedUniqueID: "pathoschild.contentpatcher",
        ExtraArgs:         "",
        Convert:           CPA2SC
    },
    
    {
        Name:              "SAAT2CP",
        Needs16:           false,
        Repo:              "https://github.com/AnotherPillow/SAAT2CP",
        GitFile:           "https://github.com/AnotherPillow/SAAT2CP.git",
        InputDirectory:    "input",
        OutputDirectory:   "output",        RequirementsFile:  "requirements.txt",
        SupportedUniqueID: "zerometers.saat.mod",
        ExtraArgs:         "",
        Convert:           SAAT2CP,
    },
    
    {
        Name:              "MTN2CP",
        Needs16:           false,
        Repo:              "https://github.com/AnotherPillow/MTN2CP",
        GitFile:           "https://github.com/AnotherPillow/MTN2CP.git",
        InputDirectory:    "input",
        OutputDirectory:   "output",        RequirementsFile:  "requirements.txt",
        SupportedUniqueID: "sgtpickles.mtn",
        ExtraArgs:         "",
        Convert:           MTN2CP,
    },
] as Converter[]