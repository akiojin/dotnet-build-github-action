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

	if (output) {
		builder.Append('--output', output)
	}

    core.startGroup('Run dotnet clean')
	await exec.exec('dotnet', builder.Build())
	core.endGroup()
}

async function Exec(
	command: string,
	configuration: string,
	framework: string,
	additionalArguments: string,
	output: string): Promise<void>
{
	const builder = new ArgumentBuilder()
		.Append(command)
		.Append('--configuration', configuration)

	if (core.getInput('project')) {
		builder.Append(core.getInput('project'))
	}

	if (framework) {
		builder.Append('--framework', framework)
	}

	if (additionalArguments) {
		builder.Append(additionalArguments)
	}

	if (output) {
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

	if (output) {
		nupkg = path.join(output, '*.nupkg')
	} else {
		nupkg = path.join('**', configuration, '*.nupkg')
	}

	const builder = new ArgumentBuilder()
		.Append('nuget', 'push')
		.Append(nupkg)
		.Append('--source', `${source}`)
		.Append('--api-key', apiKey)

	core.startGroup('Run dotnet nuget push')
	await exec.exec('dotnet', builder.Build())
	core.endGroup()
}

async function Run(): Promise<void> 
{
	try {
		const command = core.getInput('command')
		const configuration = core.getInput('configuration')
		const framework = core.getInput('framework')
		const additionalArguments = core.getInput('additional-arguments')
		const output = core.getInput('output')

		if (core.getBooleanInput('clean')) {
			await Clean(configuration, output)
		}

		if (core.getBooleanInput('publish')) {
			await Publish(configuration, core.getInput('source'), core.getInput('api-key'), output)
		} else {
			await Exec(command, configuration, framework, additionalArguments, output)
		}
	} catch (ex: any) {
		core.setFailed(ex.message);
	}
}

Run()
