import * as core from '@actions/core'
import * as exec from '@actions/exec'
import path from 'path'
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

    core.startGroup('Run dotnet clean')
	await exec.exec('dotnet', builder.Build())
	core.endGroup()
}

async function Build(
	configuration: string,
	output: string): Promise<void>
{
	const builder = new ArgumentBuilder()
		.Append('build')
		.Append('--configuration', configuration)

	if (!!core.getInput('project')) {
		builder.Append(core.getInput('project'))
	}

	if (!!output) {
		builder.Append('--output', output)
	}

	core.startGroup('Run dotnet build')
	await exec.exec('dotnet', builder.Build())
	core.endGroup()
}

async function Publish(
	configuration: string,
	source: string,
	apiKey: string,
	output: string): Promise<void>
{
	var nupkg = ''
	if (!!output) {
		nupkg = path.join(output, '*.nupkg')
	} else {
		nupkg = path.join('**', configuration, '*.nupkg')
	}

	const builder = new ArgumentBuilder()
		.Append('nuget', 'push')
		.Append(nupkg)
		.Append('--source', `${source}`)
		.Append('--api-key', apiKey)

	core.startGroup('Run dotnet build')
	await exec.exec('dotnet', builder.Build())
	core.endGroup()
}

async function Run(): Promise<void> 
{
	try {
		const configuration = core.getInput('configuration')
		const output = core.getInput('output')

		if (!!core.getBooleanInput('clean')) {
			await Clean(configuration, output)
		}

		await Build(configuration, output)

		if (!!core.getBooleanInput('publish')) {
			await Publish(configuration, core.getInput('source'), core.getInput('api-key'), output)
		}
	} catch (ex: any) {
		core.setFailed(ex.message);
	}
}

Run()
