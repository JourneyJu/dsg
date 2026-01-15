import React, { useState } from 'react'
import { Dropdown, Image, Menu, MenuProps } from 'antd'
import { debounce } from 'lodash'
import classnames from 'classnames'
import styles from './styles.module.less'
import { formatTime, OperateType } from '@/utils'
import { IAssemblyLineItem } from '@/core/apis/assemblyLine/index.d'
import { AssemblyLineConfigStatus, AssemblyLineStatus } from './const'
import __ from './locale'
import { EllipsisOutlined } from '@/icons'

interface IAssemblyLineCardItem {
    item: IAssemblyLineItem
    onOperateClick: (OperateType) => void
}

const logo =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjM1OHB4IiBoZWlnaHQ9IjE5MnB4IiB2aWV3Qm94PSIwIDAgMzU4IDE5MiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCiAgICA8dGl0bGU+5Zu+PC90aXRsZT4NCiAgICA8ZGVmcz4NCiAgICAgICAgPGZpbHRlciBpZD0iZmlsdGVyLTEiPg0KICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUdyYXBoaWMiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAuMDAwMDAwIDAgMCAwIDAgMC4wMDAwMDAgMCAwIDAgMCAwLjAwMDAwMCAwIDAgMCAwLjA2MDAwMCAwIj48L2ZlQ29sb3JNYXRyaXg+DQogICAgICAgIDwvZmlsdGVyPg0KICAgIDwvZGVmcz4NCiAgICA8ZyBpZD0i6aG16Z2iLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0i5rWB5rC057q/LeiNieeovyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTY4Mi4wMDAwMDAsIC0yNDEuMDAwMDAwKSI+DQogICAgICAgICAgICA8ZyBpZD0iMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjYyLjAwMDAwMCwgMjIxLjAwMDAwMCkiPg0KICAgICAgICAgICAgICAgIDxnIGlkPSLlm74iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwLjAwMDAwMCwgMjAuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaIiIGZpbGwtb3BhY2l0eT0iMCIgZmlsbD0iIzAwMDAwMCIgeD0iMCIgeT0iMCIgd2lkdGg9IjM1OCIgaGVpZ2h0PSIxOTIiIHJ4PSIzIj48L3JlY3Q+DQogICAgICAgICAgICAgICAgICAgIDxnIGZpbHRlcj0idXJsKCNmaWx0ZXItMSkiIGlkPSLnvJbnu4QiPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTEwLjAwMDAwMCwgODIuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTEzLjM5ODcyODQsMC44ODk5NTM2MTMgTDkuMjI3NzQ0MjcsMC44ODk5NTM2MTMgQzkuMTc2OTY4MTksMS4wMTE1ODQ0NyAyLjIwNTk4MzM2LDE5LjI4NjYzOCAwLjgyNzc0NDEyNiwyMi44ODk5NTM2IEw1LjAyNzc0NDIsMjIuODg5OTUzNiBDOC41OTY2NTQxMSwxMy41Mzk1NzI3IDEwLjY5Nzg2MzUsOC4wMzgzMDU3OCAxMS4zMzEzNzI0LDYuMzg2MTUyNzMgQzExLjgwMjg3NjIsNy42MzI4NzA4IDEzLjM0Nzk1MDgsMTEuNzA3NTA3NCAxNC43OTE0NzI2LDE1LjQ2Mjg2MjEgQzEyLjU1ODU1OTEsMTQuNzIyOTk2NSAxMC4xNjIyMTc3LDE0LjcyMjk5NjUgNy45MjkyOTg0NSwxNS40NjI4NjIxIEM5LjQ2NTkyMjk2LDE1Ljc3NzUzOTMgMTAuOTI3ODg0OCwxNi40MDc5NTEyIDEyLjIzMDg1MjUsMTcuMzE3NzM2MSBDMTQuMzEyNzA5NCwxOC41OTE3Njk0IDE2LjA5ODk2NzksMjAuMzMzOTE1NCAxNy40NjA5MDI5LDIyLjQxODYzNDkgTDE3LjYyNzc0NDQsMjIuODU5NTQ5NiBMMjEuODI3NzQ0MSwyMi44NTk1NDk2IEMyMC4zMzM0NDE5LDE5LjA2NjE4MjIgMTMuNTgwMDc1OCwxLjM5MTY4MTY1IDEzLjM5ODcyODQsMC44ODk5NTM2MTMgWiIgaWQ9Iui3r+W+hCIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTM2LjgyNzc0NDEsMjIuODg5OTUzNiBMMzMuMDUxOTAyOSwyMi44ODk5NTM2IEwzMy4wNTE5MDI5LDE1LjM4MjY1NzUgQzMzLjEwNDkxMDUsMTQuMzUyNjk4MyAzMy4wMjM4NTMyLDEzLjMyMDA3NTcgMzIuODEwODkwNSwxMi4zMTIxNzMgQzMyLjY2NzY3ODcsMTEuODc0MTgyNiAzMi4zOTQzNDc3LDExLjQ5MzQzODEgMzIuMDI5NDMwNCwxMS4yMjM2MTQ2IEMzMS42Mzk2NDU0LDEwLjk2MDc2NzMgMzEuMTgwODEwNSwxMC44MjcxMzM2IDMwLjcxNDgyMTUsMTAuODQwNzQyMiBDMzAuMDg3MDU0OCwxMC44MzE2MjU0IDI5LjQ3MjAzMSwxMS4wMjMxMjExIDI4Ljk1NDcwNzQsMTEuMzg4Nzc0NCBDMjguNDQ4MzA5OCwxMS43Mzg2MDU3IDI4LjA3MjM4MTYsMTIuMjU0NzE4NCAyNy44ODg0MTU2LDEyLjg1MjY5OCBDMjcuNjQ5MzgxNCwxMy45NTg0Nzk2IDI3LjU1MzYwOTIsMTUuMDkxODg5NyAyNy42MDM1ODQ2LDE2LjIyMzQ3NDIgTDI3LjYwMzU4NDYsMjIuODY3NDMwNyBMMjMuODI3NzQ0MSwyMi44Njc0MzA3IEwyMy44Mjc3NDQxLDguMjI4MjAzNTEgTDI3LjMzMzM2MzcsOC4yMjgyMDM1MSBMMjcuMzMzMzYzNywxMC4zNzUyOTA3IEMyOC40MTA1NDI2LDguODA5MDA4NDMgMzAuMTYzNDEzOSw3Ljg4MTQ4MDMzIDMyLjAyOTQzMDQsNy44OTAzNzYwMiBDMzIuODE0NTk1OSw3Ljg4MDY0MDUxIDMzLjU5MzExOTksOC4wMzkxNTkzNiAzNC4zMTUzODM1LDguMzU1ODI4MyBDMzQuOTI3OTIyMSw4LjYwMDk3NTkyIDM1LjQ2NjkzNzQsOS4wMDc0NjMwNyAzNS44NzgzMDM3LDkuNTM0NDc0NDIgQzM2LjIzMjEzODgsMTAuMDE3NjU1OSAzNi40ODExNzQzLDEwLjU3MzE0NjggMzYuNjA4NjQwNiwxMS4xNjM1NTc5IEMzNi43Njc5MzQxLDEyLjAyNDMyMDggMzYuODM2NDkyOCwxMi45MDAyMjc0IDM2LjgxMzEzNDgsMTMuNzc2MDk2NSBMMzYuODI3NzQ0MSwyMi44ODk5NTM2IFoiIGlkPSLot6/lvoQiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zOS44Mjc3NDQxLDguODg5OTUzNjEgTDQzLjkzNDI2OTUsOC44ODk5NTM2MSBMNDcuNDIxMDc3MywxOC45ODc5NDQgTDUwLjgzMzIxNiw4Ljg4OTk1MzYxIEw1NC44Mjc3NDQxLDguODg5OTUzNjEgTDQ5LjY3NTkzMzIsMjIuNTc5Nzk3NyBMNDguNzU3NTY5MSwyNS4wNTY5NDA2IEM0OC41MDU4Njc1LDI1LjcyNTY3MTggNDguMTgwNDIwMywyNi4zNjU3MTY3IDQ3Ljc4NjkzNTUsMjYuOTY1Nzk2NCBDNDcuNTAzMDYsMjcuMzc4MTg1NyA0Ny4xNDY2NDY2LDI3LjczODMwNyA0Ni43MzQxNjk1LDI4LjAyOTUwODIgQzQ2LjI3ODEwNDEsMjguMzI0MTYxMiA0NS43NzI3MTgsMjguNTM4NjgwNCA0NS4yNDA4ODk3LDI4LjY2MzM2MzkgQzQ0LjU5Njc4NTUsMjguODIyMzkxMyA0My45MzQwOTg3LDI4Ljg5ODMyMzkgNDMuMjY5NzYwOCwyOC44ODkyMjE3IEM0Mi41MzY3OTIxLDI4Ljg5MTMzOSA0MS44MDU3NjAyLDI4LjgxNTYwNjggNDEuMDg5NTczMiwyOC42NjMzNjM5IEw0MC43NDYxMTk1LDI1LjcxMjY1MyBDNDEuMjg0MTExNCwyNS44MjIyNzAzIDQxLjgzMTcxMzIsMjUuODgwODI5MSA0Mi4zODEyNjI4LDI1Ljg4NzUxMDYgQzQzLjEyMzA4MzYsMjUuOTU3MTM5MyA0My44NTYyMjksMjUuNjg4MTkyNyA0NC4zNjczMjIzLDI1LjE1ODkzOTggQzQ0LjgzMjU3MDksMjQuNTc2MzA5NCA0NS4xNzA1MzksMjMuOTA2ODI2IDQ1LjM2MDM1NDcsMjMuMTkxNzk4MiBMMzkuODI3NzQ0MSw4Ljg4OTk1MzYxIFoiIGlkPSLot6/lvoQiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik01Ni44Mjc3NDQxLDIyLjg4OTk1MzYgTDU2LjgyNzc0NDEsMi44ODk5NTM2MSBMNzAuODI3NzQ0MSwyLjg4OTk1MzYxIEw3MC44Mjc3NDQxLDYuMjY3NzMxMTUgTDYwLjk4NDU4ODQsNi4yNjc3MzExNSBMNjAuOTg0NTg4NCwxMC45OTM2NTYxIEw2OS41MDI3MDI5LDEwLjk5MzY1NjEgTDY5LjUwMjcwMjksMTQuMzcxNDMzNiBMNjAuOTU0Mjk1MiwxNC4zNzE0MzM2IEw2MC45NTQyOTUyLDIyLjg4OTk1MzYgTDU2LjgyNzc0NDEsMjIuODg5OTUzNiBaIiBpZD0i6Lev5b6EIiBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9Im5vbnplcm8iPjwvcGF0aD4NCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNzYuODIxMjc0OSwxMi41OTk5MTQ5IEw3My4yNTUxMzg4LDExLjk4Mzg3NjcgQzczLjU0Nzk5MywxMC43NTQ3MDIgNzQuMjgwMjA0LDkuNjY0MjE4OTggNzUuMzIzMzQ1NSw4LjkwMzY4NzUgQzc2LjY0MTExMzksOC4xNTU1MDA2IDc4LjE2MjE1NTMsNy44MDc5MDkzIDc5LjY4Nzg3MjIsNy45MDYyOTMwOSBDODEuMDIyNTEwOCw3LjgzODU0NDYxIDgyLjM1NjkzOTUsOC4wNDM0NzQ5MiA4My42MDM3NzE1LDguNTA3NjYzMTcgQzg0LjM1Nzg2NDUsOC44MjA2MDk1IDg0Ljk5MDkyMjQsOS4zNTQyMjYyMyA4NS40MTM0NTQ5LDEwLjAzMzA5MDIgQzg1Ljg0NzAyMzYsMTEuMTEzNDYzOSA4Ni4wMjYyMzE3LDEyLjI3MzI3MiA4NS45MzgxMTI5LDEzLjQyODYzMzMgTDg1LjkzODExMjksMTcuODI4OTAzNyBDODUuOTE0MTMwOCwxOC43NjEyMTMgODUuOTc1MTkzOSwxOS42OTM3NTAzIDg2LjEyMDYwNTIsMjAuNjE1NzQxMSBDODYuMjc1MDQzMSwyMS4yODE0MDY2IDg2LjUxMjQ4NDgsMjEuOTI2NTg0MiA4Ni44Mjc3NDQxLDIyLjUzNzE5MjcgTDgyLjk0MjI1MzcsMjIuNTM3MTkyNyBDODIuODM1ODAyLDIyLjI4MDUxMTYgODIuNzE0MTQwMiwyMS45MDY0ODUxIDgyLjU2MjA2ODgsMjEuNDE1MTIzNiBDODIuNTI0Njg2MiwyMS4yNjM3NzY0IDgyLjQ3OTAwODIsMjEuMTE0NDQ1IDgyLjQyNTIwNzYsMjAuOTY3NzYyMyBDODEuNzk1Mjk0NCwyMS41Nzg2NjE4IDgxLjA0OTE4NDUsMjIuMDY2NzA1MSA4MC4yMjc3MjgyLDIyLjQwNTE4MzEgQzc5LjQ1MzcyNjEsMjIuNzIzMTA4OSA3OC42MjA1ODYzLDIyLjg4NTMyMjggNzcuNzc5MzM2OCwyMi44ODE4ODAzIEM3Ni40NTEyNjUxLDIyLjk1NTQ4NyA3NS4xNDYyNDc2LDIyLjUyMzYzNjQgNzQuMTQ0NzcwMSwyMS42NzkxNDEzIEM3My4yNzU0Nzc3LDIwLjg5NTYzMzUgNzIuNzk2NDg3NSwxOS43OTAwNjI0IDcyLjgyOTMzMzYsMTguNjQyOTU0MSBDNzIuODE1ODYzMywxNy44ODE4MDk3IDczLjAyMzk2MjYsMTcuMTMyMjczOCA3My40MzAwMjA2LDE2LjQ3OTQ4NzggQzczLjgyNzMwNzQsMTUuODQwOTMyNyA3NC40MTIxNDU2LDE1LjMzMDQ2NDYgNzUuMTEwNDQyOSwxNS4wMTI3MzAzIEM3Ni4xMDk1MTg5LDE0LjU5MTg4NTMgNzcuMTU5NDM2MiwxNC4yOTM3NTM4IDc4LjIzNTU2MywxNC4xMjUzNDM2IEM3OS41Mjk5OTkzLDEzLjkyODk5NjcgODAuODAyNzM5NywxMy42MTcxOTU3IDgyLjAzNzQxMTYsMTMuMTkzOTUyMyBMODIuMDM3NDExNiwxMi44MTk5Mjk1IEM4Mi4wOTgwOTIxLDEyLjI0NTk5ODIgODEuODk1MjcxNywxMS42NzUyMDcxIDgxLjQ4MjM0NTUsMTEuMjU3ODMzOCBDODAuODQ5NTQzLDEwLjg4MzkzMDggODAuMTA2NjIzMywxMC43MjE1NDg3IDc5LjM2ODUxNzksMTAuNzk1ODA1OCBDNzguNzk0Mzg4OCwxMC43NjMwOTA3IDc4LjIyMzY5NCwxMC45MDEzMzc2IDc3LjczMzcyNzgsMTEuMTkxODMwOCBDNzcuMjg5MDM0MSwxMS41NjE0NzAyIDc2Ljk3MDkxLDEyLjA1MjQwMTYgNzYuODIxMjc0OSwxMi41OTk5MTQ5IFogTTgyLjA3NTQzMywxNS42ODAxMDUzIEM4MS41NzM1ODY0LDE1Ljg0MTQ0OCA4MC43NzUxOTUyLDE2LjAzMjEyNjYgNzkuNjg3ODcyMiwxNi4yNTk0NzQ3IEM3OC45NDI4NjM4LDE2LjM2NDYxNTggNzguMjIwOTQ0LDE2LjU4NzYyNjIgNzcuNTUxMjM1MSwxNi45MTk1MTQ3IEM3Ny4wNzcwMzYzLDE3LjIwOTA0ODEgNzYuNzg5OTcxNiwxNy43MTI5NTggNzYuNzkwODY1LDE4LjI1NDI2MzMgQzc2Ljc4NzUwMDUsMTguNzc2NjQyNSA3Ny4wMTA4MjE4LDE5LjI3NjU2OTkgNzcuNDA2NzYyNywxOS42MzMwMTM3IEM3Ny44Mjc1MjEyLDIwLjAyMDQyMjUgNzguMzkxNjcyMiwyMC4yMjkwOTA5IDc4Ljk3MzEyMjksMjAuMjEyMzgzMSBDNzkuNzA3Mzg3MiwyMC4yMDM0MjExIDgwLjQxOTE3ODIsMTkuOTY2ODYzMSA4MS4wMDMzMDg3LDE5LjUzNzY3NTkgQzgxLjQ1MjQzNDYsMTkuMjMzMDEzMyA4MS43ODE5NDAxLDE4Ljc5MTE4NzcgODEuOTM4NTU5NiwxOC4yODM1OTcxIEM4Mi4wNzAxMDc0LDE3LjY3NjI0NDYgODIuMTIxMjAzNSwxNy4wNTUyNDY2IDgyLjA5MDYzMTgsMTYuNDM1NDgzOSBMODIuMDc1NDMzLDE1LjY4MDEwNTMgWiIgaWQ9Iui3r+W+hCIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTg5LjgyNzc0NDEsMjIuNTk3ODA1NiBMODkuODI3NzQ0MSwyLjg4OTk1MzYxIEw5My42MjEyNDYzLDIuODg5OTUzNjEgTDkzLjYyMTI0NjMsOS45Nzc0ODA2OCBDOTQuNjM0OTM3OSw4LjcyMzA0NzggOTYuMTYzNjg3Miw3Ljk5MDgyNzIyIDk3Ljc4MTYyNTcsNy45ODQ3OTgyNyBDOTkuNDM0Njk3OSw3Ljk0NzE3NTkgMTAxLjAxOTcxOCw4LjYzOTM0MTU3IDEwMi4xMTA3NjQsOS44NzUyOTI2IEMxMDMuMjU1NDE4LDExLjEzMDc1NTQgMTAzLjgyNzc0NCwxMi45MzYwOTE5IDEwMy44Mjc3NDQsMTUuMjkxMzAyMSBDMTAzLjgyNzc0NCwxNy43MjQzNzAzIDEwMy4yNDMxODgsMTkuNTk3ODMyOSAxMDIuMDc0MDc1LDIwLjkxMTY5IEMxMDEuMDM0MzMsMjIuMTc1NzgzNSA5OS40NzQ4MjQ1LDIyLjkwMzE1NjUgOTcuODMyOTgyOSwyMi44ODk5NTM2IEM5Ni45ODc5MTY2LDIyLjg4Mjk0MjYgOTYuMTU3MDkyOCwyMi42NzI1NjY2IDk1LjQxMTU5NDcsMjIuMjc2NjQwNCBDOTQuNTkyMDIzLDIxLjg1NDA3MjcgOTMuODg1Mjc1LDIxLjI0MzU5NjUgOTMuMzQ5NzUwNCwyMC40OTU2MzQzIEw5My4zNDk3NTA0LDIyLjU5MDUwNjYgTDg5LjgyNzc0NDEsMjIuNTk3ODA1NiBaIE05My41OTkyMzQ5LDE1LjE1OTkxNzkgQzkzLjUxNzcxNTQsMTYuMjk1Nzk3MyA5My43NTkyODQxLDE3LjQzMTU2MzIgOTQuMjk2Mjk4MywxOC40MzcyNjE2IEM5NC44MzAyMTA0LDE5LjM2MDI1NjggOTUuODE1OTc4NiwxOS45MzI1MTk2IDk2Ljg4NjQ0NiwxOS45NDA4OTUzIEM5Ny43NTE1OTY5LDE5Ljk1OTA4OTggOTguNTcyMDA5MSwxOS41NTkxOTAzIDk5LjA4NzcwNTUsMTguODY3OTEyNCBDOTkuNzYxMjc4OSwxNy44ODI3OTAyIDEwMC4wNzQ2ODMsMTYuNjk3NTg5NSA5OS45NzU1NTE0LDE1LjUxMDI3NzggQzk5Ljk3NTU1MTQsMTMuODc1MjU2MiA5OS42ODIwNTQ0LDEyLjcwNzM4MjkgOTkuMDg3NzA1NSwxMS45ODQ3NjIzIEM5OC41NDExNTE4LDExLjI4NjQ4ODcgOTcuNjk1MTgwMiwxMC44ODYwMDg4IDk2LjgwNTczMiwxMC45MDQ0ODA0IEM5NS45Mjc2NjA3LDEwLjg4OTIxMTYgOTUuMDkxNDA2MywxMS4yNzY4ODY2IDk0LjUzODQzODEsMTEuOTU1NTY2MSBDOTMuODU0NDQwNywxMi44Nzk2NTc2IDkzLjUyMTY5MDEsMTQuMDE0OTM4MyA5My41OTkyMzQ5LDE1LjE1OTkxNzkgWiIgaWQ9Iui3r+W+hCIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTExMC41MDYwMDUsMjIuODg5OTUzNiBMMTA2LjgyNzc0NCwyMi44ODk5NTM2IEwxMDYuODI3NzQ0LDguMjI4Mjk1ODYgTDExMC4yNDI3NjgsOC4yMjgyOTU4NiBMMTEwLjI0Mjc2OCwxMC4zMDc4MDQxIEMxMTAuNjM2MzMyLDkuNTUxNTI0ODggMTExLjE3NDEwOSw4Ljg4OTQ4NTgxIDExMS44MjIyMTYsOC4zNjM0MjY1NCBDMTEyLjI5NTI1OCw4LjA0NDA0NDc0IDExMi44NDcyNzgsNy44Nzk0ODU3NSAxMTMuNDA4Nzc1LDcuODkwNDY5ODEgQzExNC4yNjUxNTUsNy45MDE0MDg3NyAxMTUuMTAyMTE1LDguMTYxMTU5MzUgMTE1LjgyNzc0NCw4LjY0MTE5NDY3IEwxMTQuNjg5NCwxMi4wMTk0NTc1IEMxMTQuMTg0OTM5LDExLjYzODg0MTEgMTEzLjU4NzExOSwxMS40MTk4ODE3IDExMi45Njc2NjEsMTEuMzg4ODQ4MiBDMTEyLjQ5NDg1NywxMS4zNzMyNzYzIDExMi4wMzE3ODEsMTEuNTMyNjE0OCAxMTEuNjU4NTcyLDExLjgzOTI4MzcgQzExMS4yMzAxMTUsMTIuMjcyMDA3NiAxMTAuOTM3MTk3LDEyLjgzMjU1MDEgMTEwLjgxOTA1MSwxMy40NDU4MzI5IEMxMTAuNTUwNDYxLDE1LjA2NjA5NTYgMTEwLjQ0Nzg5MywxNi43MTIxNTIgMTEwLjUxMzEyNywxOC4zNTU1NzQxIEwxMTAuNTA2MDA1LDIyLjg4OTk1MzYgWiIgaWQ9Iui3r+W+hCIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTExNi44Mjc3NDQsNi40MzU5NDc1NSBMMTE2LjgyNzc0NCwyLjg4OTk1MzYxIEwxMjAuODI3NzQ0LDIuODg5OTUzNjEgTDEyMC44Mjc3NDQsNi40MzU5NDc1NSBMMTE2LjgyNzc0NCw2LjQzNTk0NzU1IFogTTExNi44Mjc3NDQsMjIuODg5OTUzNiBMMTE2LjgyNzc0NCw4LjQwMTgyMzIzIEwxMjAuODI3NzQ0LDguNDAxODIzMjMgTDEyMC44Mjc3NDQsMjIuODg5OTUzNiBMMTE2LjgyNzc0NCwyMi44ODk5NTM2IFoiIGlkPSLot6/lvoQiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMzcuNTk5MTA4LDEyLjQ2MjU4NzMgTDEzMy43MTIzMzEsMTMuMTM3NjEzMyBDMTMzLjYzNTc2NiwxMi40OTAxMDY1IDEzMy4zMTkxNjksMTEuODkwOTE2NSAxMzIuODIwNjYxLDExLjQ1MDA0OTIgQzEzMi4zMTE5NTQsMTEuMDU4MjkwNyAxMzEuNjcyODc1LDEwLjg1NzU0NTMgMTMxLjAyMjA3NSwxMC44ODUwODEzIEMxMzAuMTI2MDQ0LDEwLjg0ODg4NjkgMTI5LjI2MTc5NSwxMS4yMDgxODE5IDEyOC42NzQ3NjcsMTEuODYwOTMzOSBDMTI4LjA4NzkzOCwxMi41MTM5NDc2IDEyNy43OTgzNDMsMTMuNjA3MTk2MSAxMjcuNzk4MzQzLDE1LjEzMzM0MzEgQzEyNy43OTgzNDMsMTYuODM1NTgxOSAxMjguMDk1NTY2LDE4LjAzNjQ0MzEgMTI4LjY5MDAxMywxOC43MzU5MjY3IEMxMjkuMjY1Njc5LDE5LjQzMjk0MDkgMTMwLjE1MTEwNCwxOS44MjUxMjIxIDEzMS4wNzU0MjgsMTkuNzkyNDg5MSBDMTMxLjc0Njc0MiwxOS44MTkxNDI5IDEzMi40MDM0MzgsMTkuNTk4NzgwNSAxMzIuOTEyMTIyLDE5LjE3NjE2MTUgQzEzMy40OTMxOTUsMTguNjAxNDA5IDEzMy44NjI2MTEsMTcuODU5MTU3IDEzMy45NjM4MjksMTcuMDYzMDM0NSBMMTM3LjgyNzc0NCwxNy43MDEzNzU1IEMxMzcuNTU2ODI2LDE5LjIwNzM2NDkgMTM2Ljc0ODE2MywyMC41NzUwMDE0IDEzNS41NDE0MDcsMjEuNTY4MDk5NiBDMTM0LjIxNzg3NCwyMi40OTYxMTMzIDEzMi42MDQwNzIsMjIuOTU5NjMxNyAxMzAuOTY4NzMzLDIyLjg4MTQ2NTYgQzEyOS4wMTc2ODEsMjIuOTY4NDcwNyAxMjcuMTIxODMxLDIyLjI0NDI2MDIgMTI1Ljc2MzUwNSwyMC44OTMwNzQgQzEyNC40Njc5MTYsMTkuNTcyMzcxNyAxMjMuODI3NzQ0LDE3Ljc0NTM5NzkgMTIzLjgyNzc0NCwxNS40MDQ4MTkzIEMxMjMuODI3NzQ0LDEzLjA2NDI0MjIgMTI0LjQ3NTU0NCwxMS4xOTMyNDU2IDEyNS43NzExMzMsOS44Nzk4Nzg5NyBDMTI3LjE1NDcxOCw4LjUyNDk5MTI0IDEyOS4wNzM4NzIsNy44MDQwODMgMTMxLjA0NDk0OSw3Ljg5ODgyNDg0IEMxMzIuNTczMzk2LDcuODI0MzY4MjggMTM0LjA4NjgwNSw4LjIyMDEwNjgyIDEzNS4zNjYxMjUsOS4wMjg3NTk1MyBDMTM2LjQ4NDg2MSw5LjkwMzc0IDEzNy4yNzAyNjYsMTEuMTExNTA1MyAxMzcuNTk5MTA4LDEyLjQ2MjU4NzMgWiIgaWQ9Iui3r+W+hCIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4='

/**
 * 工作流程卡片
 * @param item 工作流程item
 * @param onOperateClick
 * @returns
 */
const AssemblyLineCardItem: React.FC<IAssemblyLineCardItem> = ({
    item,
    onOperateClick,
}) => {
    // 更多按钮的显示隐藏
    const [hidden, setHidden] = useState(true)

    // 更多按钮的背景色
    const [bg, setBg] = useState('rgba(0, 0, 0, 0)')
    const canEdit = true

    const textStyle = {
        color: 'rgba(0, 0, 0, 0.85)',
        margin: '0 4px',
    }

    // 菜单项
    const items: MenuProps['items'] = [
        {
            key: OperateType.EDIT,
            label: <div style={textStyle}>{__('基本信息')}</div>,
        },
        {
            key: OperateType.PREVIEW,
            label: <div style={textStyle}>{__('查看工作流程')}</div>,
        },
        {
            key: OperateType.DELETE,
            label: <div style={textStyle}>{__('删除')}</div>,
        },
    ]

    // 菜单项选中
    const handleMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => {
        domEvent.stopPropagation()
        onOperateClick(key)
        domEvent.preventDefault()
    }

    return (
        <div
            className={styles.cardItemWrapper}
            aria-hidden
            onFocus={() => {}}
            onMouseOver={() => {
                setHidden(false)
            }}
            onMouseLeave={() => {
                setHidden(true)
                setBg('rgba(0, 0, 0, 0)')
            }}
        >
            <div
                className={styles.imageWrapper}
                onClick={debounce(
                    () => canEdit && onOperateClick(OperateType.DETAIL),
                    2000,
                    { leading: true },
                )}
            >
                <Image
                    className={classnames(
                        styles.itemImage,
                        !canEdit && styles.itemImageDisabled,
                    )}
                    src={item.image || 'error'}
                    fallback={logo}
                    preview={false}
                />
            </div>
            <div className={styles.itemTitleWrapper}>
                <span
                    className={classnames(
                        styles.itemName,
                        !canEdit && styles.itemNameDisabled,
                    )}
                    title={item.name}
                    onClick={debounce(
                        () => canEdit && onOperateClick(OperateType.DETAIL),
                        2000,
                        { leading: true },
                    )}
                >
                    {item.name}
                </span>
                {items.filter((i) => i !== null).length > 0 && (
                    <Dropdown
                        menu={{
                            items,
                            onClick: handleMenuClick,
                        }}
                        placement="bottomLeft"
                        trigger={['click']}
                    >
                        <div className={styles.itemMore}>
                            <EllipsisOutlined
                                hidden={hidden}
                                onFocus={() => {}}
                                onMouseLeave={() => {
                                    setHidden(true)
                                }}
                            />
                        </div>
                    </Dropdown>
                )}
            </div>
            <div className={styles.itemDetailWrapper}>
                <div className={styles.updateBy} title={item.updated_by}>
                    {item.updated_by}
                </div>
                <span className={styles.itemDetail}>
                    {`${__('更新于')} ${formatTime(item.updated_at)}`}
                </span>
            </div>
            <div
                className={classnames(
                    styles.itemStatusMessage,
                    item.config_status === AssemblyLineConfigStatus.MISSINGROLE
                        ? styles.itemStatusMessageError
                        : styles.itemStatusMessageNormal,
                )}
                hidden={item.status !== AssemblyLineStatus.EDITING}
            >
                <span className={styles.itemStatus}>
                    {__('存在未发布的变更')}
                </span>
            </div>
        </div>
    )
}

export default AssemblyLineCardItem
