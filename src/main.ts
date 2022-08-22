import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { ArgumentBuilder } from '@akiojin/argument-builder'

async function Clean(
	configuration: string,
	output: string): Promise<void>
{
	const builder = new ArgumentBuilder()
		.Append('clean')
		.Append('--configuration', configuration)

	if (core.getBooleanInput('nologo')) {
		builder.Append('--nologo')
	}

	if (!!output) {
		builder.Append('--output', output)
	}

	await exec.exec('dotnet', builder.Build())
}

async function Run(): Promise<void> 
{
	try {
		const configuration = core.getInput('configuration')
		const output = core.getInput('output')

		if (!!core.getBooleanInput('clean')) {
			await Clean(configuration, output)
		}

		const builder = new ArgumentBuilder()
			.Append('build')
			.Append('--configuration', configuration)

		if (!!core.getInput('project')) {
			builder.Append(core.getInput('project'))
		}

		if (!!output) {
			builder.Append('--output', output)
		}

		await exec.exec('dotnet', builder.Build())
	} catch (ex: any) {
		core.setFailed(ex.message);
	}
}

Run()
